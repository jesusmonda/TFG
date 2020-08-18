const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const service = require('../services/user.service');

const s3 = new AWS.S3();

exports.getUserToCall = async (event) => {
  const { connection } = event;

  // variables
  const languages = [];

  // get auth user
  const { authorizer } = event.requestContext;

  // get languages
  const myLanguages = await service.getMyLanguages(connection, authorizer.userId);
  const myLanguagesNative = myLanguages.filter((x) => x.native === true);
  const myLanguagesLearn = myLanguages.filter((x) => x.learn === true);

  // the other way around from my native language
  myLanguagesNative.map((x) => {
    languages.push({ languageId: x.languageId, native: false, learn: true });
  });
  myLanguagesLearn.map((x) => {
    languages.push({ languageId: x.languageId, native: true, learn: false });
  });

  const user = await connection('user_account')
    .select('user_account.id AS userId', 'user_account.avatar AS userImage', 'user_account.name AS userName', 'user_account.surname AS userSurname')
    .innerJoin('user_language', 'user_language.userId', '=', 'user_account.id')
    .whereNotNull('user_account.socketId')
    .andWhere('onCall', false)
    .andWhere(function () {
      languages.map((language) => this.orWhere(language));
    })
    .orderByRaw('RANDOM()')
    .limit(1)
    .first();

  const results = await service.formatterGetUserAvailable(connection, user);
  return {
    statusCode: 200,
    body: results,
  };
};

exports.getUserProfile = async (event) => {
  // connection db
  const { connection } = event;

  // get userId for profile
  const userId = event.pathParameters.id;

  // get user logued
  const user = event.requestContext.authorizer;
  user.userId = Number(user.userId);

  const userInfo = await connection('user_account')
    .select('user_account.id AS userId', 'user_account.aboutUser AS aboutUser', 'user_account.name AS name', 'user_account.avatar AS avatar', 'user_account.surname AS surName')
    .where('user_account.id', userId);

  if (!userInfo.length) {
    return {
      statusCode: 404,
      body: 'data-invalid',
    };
  }

  const userLanguages = await connection('user_account')
    .select('language.name AS languageName', 'user_language.native', 'user_language.learn')
    .innerJoin('user_language', 'user_language.userId', '=', 'user_account.id')
    .innerJoin('language', 'user_language.languageId', '=', 'language.id')
    .where('user_account.id', userId);

  const topics = await connection('user_topic').select('user_topic.topic').innerJoin('user_account', 'user_account.id', '=', 'user_topic.userId').where('user_account.id', userId);

  const numFeed = await connection('feed').where('userId', userId).count('id');

  // transform data
  const results = [];

  for (info of userInfo) {
    const userLanguage = userLanguages.map((x) => ({
      languageName: x.languageName,
      learn: x.learn,
      native: x.native,
    }));

    const result = {};
    result.id = info.userId;
    (result.aboutUser = info.aboutUser),
    (result.numFeed = numFeed[0].count),
    (result.image = `${process.env.BUCKET_ASSETS}/images/avatars/${info.avatar}`),
    (result.name = info.name),
    (result.surname = info.surName),
    (result.profileTopics = topics),
    (result.languages = userLanguage),
    results.push(result);
  }

  return {
    statusCode: 200,
    body: results[0],
  };
};

exports.updateProfile = async (event) => {
  const { connection } = event;

  // create transaction
  const trx = await connection.transaction();

  try {
    // body
    const body = JSON.parse(event.body);

    // get user logued
    const { userId } = event.requestContext.authorizer;

    // update user_account
    const userAccount = {};
    if (body.name) userAccount.name = body.name;
    if (body.surname) userAccount.surname = body.surname;
    if (body.aboutUser) userAccount.aboutUser = body.aboutUser;
    if (body.name || body.surname || body.aboutUser) {
      await trx('user_account').select('user_account.id').where('user_account.id', userId).update(userAccount);
    }

    // update WebRTC
    await trx('user_account')
      .where('user_account.id', userId)
      .update({ onCall: body.onCall || false });

    let result = {};

    // update topics
    if (body.topics) {
      const promises = [];
      promises.push(trx('user_topic').select('id').del().where('user_topic.userId', userId));
      const topics = body.topics.map((topic) => ({ userId, topic }));
      promises.push(trx('user_topic').select('user_topic.id').insert(topics));
      await Promise.all(promises);
    }

    // update languages
    if (body.learnLanguage && body.nativeLanguage) {
      for (learnLanguage of body.learnLanguage) {
        for (nativeLanguage of body.nativeLanguage) {
          if (nativeLanguage === learnLanguage) {
            return {
              statusCode: 404,
              body: 'The language cannot be repeated ',
            };
          }
        }
      }

      // delete all language
      await trx('user_language').select('id').del().where('userId', userId);

      const promises = [];
      // add native language
      for (native of body.nativeLanguage) {
        promises.push(
          trx('user_language').select('id').insert({
            userId,
            languageId: native,
            native: true,
            learn: false,
          }),
        );
      }

      // add learn language
      for (learn of body.learnLanguage) {
        promises.push(
          trx('user_language').select('id').insert({
            userId,
            languageId: learn,
            native: false,
            learn: true,
          }),
        );
      }

      await Promise.all(promises);
    }

    // generate signed url to update photo
    if (body.avatar && ['image/jpeg', 'image/png', 'image/jpg'].includes(body.fileType)) {
      const avatarName = `${userId}/${uuidv4()}.png`;
      const params = {
        Bucket: 'app-production-assets',
        Key: `images/avatars/${avatarName}`,
        Expires: 60,
        ContentType: body.fileType,
        ACL: 'public-read',
      };
      const urlSigned = await s3.getSignedUrlPromise('putObject', params);

      await trx('user_account').where('id', userId).update({ avatar: avatarName });
      result = { urlSigned };
    }

    // commit
    await trx.commit();

    // transform data
    const userInfo = await connection('user_account')
      .select(
        'user_account.id AS userId',
        'user_account.aboutUser AS aboutUser',
        'user_account.name AS name',
        'user_account.avatar AS avatar',
        'user_account.surname AS surName',
        'language.name AS languageName',
        'user_language.native',
        'user_language.learn',
      )
      .innerJoin('user_language', 'user_language.userId', '=', 'user_account.id')
      .innerJoin('language', 'user_language.languageId', '=', 'language.id')
      .where('user_account.id', userId);

    const userLanguage = userInfo.map((x) => ({
      languageName: x.languageName,
      learn: x.learn,
      native: x.native,
    }));
    const topics = await connection('user_topic')
      .select('user_topic.topic')
      .innerJoin('user_account', 'user_account.id', '=', 'user_topic.userId')
      .where('user_account.id', userId);

    result.user = {};
    result.user.id = userInfo[0].userId;
    result.user.aboutUser = userInfo[0].aboutUser;
    result.user.image = `${process.env.BUCKET_ASSETS}/images/avatars/${userInfo[0].avatar}`;
    result.user.name = userInfo[0].name;
    result.user.surname = userInfo[0].surName;
    result.user.profileTopics = topics;
    result.user.languages = userLanguage;

    return {
      statusCode: 200,
      body: result,
    };
  } catch (error) {
    console.error(error);
    // rollback
    await trx.rollback();

    return {
      statusCode: 500,
      body: 'Profile not update',
    };
  }
};
