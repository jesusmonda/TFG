const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3();

exports.getFeedByType = async (event) => {
  const { connection } = event;

  // get path parameters
  const { type } = event.pathParameters;
  if (!['general', 'doubts'].includes(type)) {
    return {
      statusCode: 404,
      body: 'type-invalid',
    };
  }

  // get query parameters
  const { page = 0 } = event.queryStringParameters || {};

  // get user
  const user = event.requestContext.authorizer;
  user.userId = Number(user.userId);

  // my languages
  const myLanguages = await connection('user_account')
    .select('user_language.languageId', 'user_language.learn', 'user_language.native')
    .innerJoin('user_language', 'user_language.userId', '=', 'user_account.id')
    .where('user_account.id', user.userId);

  const rows = connection('feed').select(
    'feed.image',
    'feed.content',
    'feed.id',
    'user_account.id AS userId',
    'user_account.avatar AS userImage',
    'user_account.name AS userName',
    'user_account.surname AS userSurname',
    'feed.like',
    'feed_like.id AS likeMe',
    'feed.comment',
    'feed.created AS created',
  );

  switch (type) {
    case 'doubts':
    case 'general':
      let language;
      if (type == 'doubts') {
        // my native language
        const myLanguagesNative = myLanguages.filter((x) => x.native == true);

        // the other way around from my native language
        language = myLanguagesNative.map((x) => ({
          'user_language.languageId': x.languageId,
          'user_language.native': false,
          'user_language.learn': true,
        }));
      } else if (type == 'general') {
        // my learn language true and my native false
        language = myLanguages.filter((x) => x.learn == true);
        language = language.map((x) => ({
          'user_language.languageId': x.languageId,
          'user_language.native': false,
          'user_language.learn': true,
        }));
      }

      rows.innerJoin('user_account', 'user_account.id', '=', 'feed.userId');
      rows.innerJoin('user_language', 'user_language.userId', '=', 'user_account.id');
      rows.leftJoin('feed_like', function () {
        this.on('feed_like.feedId', '=', 'feed.id').andOn('feed_like.userId', '=', user.userId);
      });
      rows.where((row) => {
        language.map((x) => row.orWhere(x));
      });
      rows.andWhere('feed.type', type);
      rows.andWhere('feed.userId', '<>', user.userId);
      rows.groupBy('feed.id', 'user_account.id', 'feed_like.id');

      break;

    // case "followed":
    //   rows.innerJoin('user_followed','user_followed.followedId', '=', 'feed.userId');
    //   rows.innerJoin('user_account','user_account.id', '=','user_followed.followedId');
    //   rows.leftJoin('feed_like', function() {
    //     this.on('feed_like.feedId', '=', 'feed.id').andOn('feed_like.userId', '=', user.userId);
    //   });
    //   rows.where('user_followed.userId', user.userId);

    //   break;
  }

  // order by
  rows.orderBy('created', 'DESC');

  // limit and offset
  rows.limit(15).offset(page * 15);

  const feeds = await rows;

  // transform data
  const usersId = Array.from(new Set(feeds.map((x) => x.userId))); // deleted repeat userId

  // users info
  const usersLanguage = await connection('user_account')
    .select('user_account.id', 'language.name as languageName', 'user_language.learn', 'user_language.native', 'user_account.avatar AS userImage')
    .innerJoin('user_language', 'user_language.userId', '=', 'user_account.id')
    .innerJoin('language', 'user_language.languageId', '=', 'language.id')
    .whereIn('user_account.id', usersId);

  const results = [];
  for (feed of feeds) {
    let userLanguage = usersLanguage.filter((x) => x.id == feed.userId);
    userLanguage = userLanguage.map((x) => ({
      languageName: x.languageName,
      learn: x.learn,
      native: x.native,
    }));

    const result = {};
    result.id = feed.id;
    result.content = feed.content;
    result.like = feed.like;
    result.numComment = feed.comment;
    result.created_at = feed.created;
    result.image = feed.image != null ? `${process.env.BUCKET_ASSETS}/images/feeds/${feed.image}` : null;
    result.likeMe = feed.likeMe != null;
    result.user = {
      userId: feed.userId,
      image: `${process.env.BUCKET_ASSETS}/images/avatars/${feed.userImage}`,
      name: feed.userName,
      surname: feed.userSurname,
      languages: userLanguage,
    };
    results.push(result);
  }

  return {
    statusCode: 200,
    body: results,
  };
};

exports.getFeedUserProfileByUserId = async (event) => {
  const { connection } = event;

  // get query parameters
  let { page = 0, limit = 15 } = event.queryStringParameters || {};
  limit = limit > 15 ? 15 : limit;

  // get user
  let { userId } = event.pathParameters;
  userId = Number(userId);

  // get user
  let ownerUser = event.requestContext.authorizer;
  ownerUser = Number(ownerUser.userId);

  const rows = connection('feed')
    .select(
      'feed.image',
      'feed.content',
      'feed.id',
      'user_account.id AS userId',
      'user_account.avatar AS userImage',
      'user_account.name AS userName',
      'user_account.surname AS userSurname',
      'feed.like',
      'feed_like.id AS likeMe',
      'feed.comment',
      'feed.created AS created_at',
    )
    .innerJoin('user_account', 'user_account.id', '=', 'feed.userId')
    .leftJoin('feed_like', function () {
      this.on('feed_like.feedId', '=', 'feed.id').andOn('feed_like.userId', '=', ownerUser);
    })
    .where('feed.userId', userId)
    .groupBy('feed.id', 'user_account.id', 'feed_like.id')

    // order by
    .orderBy('created', 'DESC')

    // limit
    .limit(limit)
    .offset(page * limit);

  const feeds = await rows;

  // transform data
  const usersId = Array.from(new Set(feeds.map((x) => x.userId))); // deleted repeat userId

  // users info
  const usersLanguage = await connection('user_account')
    .select('user_account.id', 'language.name as languageName', 'user_language.learn', 'user_language.native')
    .innerJoin('user_language', 'user_language.userId', '=', 'user_account.id')
    .innerJoin('language', 'user_language.languageId', '=', 'language.id')
    .whereIn('user_account.id', usersId);

  const results = [];
  for (feed of feeds) {
    let userLanguage = usersLanguage.filter((x) => x.id == feed.userId);
    userLanguage = userLanguage.map((x) => ({
      languageName: x.languageName,
      learn: x.learn,
      native: x.native,
    }));

    const result = {};
    result.id = feed.id;
    result.content = feed.content;
    result.like = feed.like;
    result.numComment = feed.comment;
    result.image = feed.image != null ? `${process.env.BUCKET_ASSETS}/images/feeds/${feed.image}` : null;
    result.created_at = feed.created_at;
    result.likeMe = feed.likeMe != null;
    result.user = {
      id: feed.userId,
      image: `${process.env.BUCKET_ASSETS}/images/avatars/${feed.userImage}`,
      name: feed.userName,
      surname: feed.userSurname,
      languages: userLanguage,
    };
    results.push(result);
  }

  return {
    statusCode: 200,
    body: results,
  };
};

exports.getCommentsByFeed = async (event) => {
  const { connection } = event;

  // get query parameters
  const { page = 0 } = event.queryStringParameters || {};

  // get feed
  const feedId = event.pathParameters.id;

  const rows = connection('feed_comment')
    .select(
      'feed_comment.content',
      'user_account.id AS userId',
      'user_account.avatar AS userImage',
      'user_account.name AS userName',
      'user_account.surname AS userSurname',
      'feed_comment.id AS id',
      'feed_comment.create_at AS create_at',
    )
    .innerJoin('user_account', 'user_account.id', '=', 'feed_comment.userId')
    .innerJoin('feed', 'feed.id', '=', 'feed_comment.feedId')
    .where('feed_comment.feedId', feedId)
    .orderBy('create_at', 'DESC')
    .limit(15)
    .offset(page * 15);

  const comments = await rows;

  // transform data
  const results = [];

  for (comment of comments) {
    const result = {};
    result.id = comment.id;
    result.content = comment.content;
    result.create_at = comment.create_at;
    result.user = {
      id: comment.userId,
      image: `${process.env.BUCKET_ASSETS}/images/avatars/${comment.userImage}`,
      name: comment.userName,
      surname: comment.userSurname,
    };
    results.push(result);
  }

  return {
    statusCode: 200,
    body: results,
  };
};

exports.getFeedId = async (event) => {
  const { connection } = event;

  // get path parameters
  const feedId = event.pathParameters.id;

  // get user
  const user = event.requestContext.authorizer;
  user.userId = Number(user.userId);

  const rows = await connection('feed')
    .select(
      'feed.image',
      'feed.content',
      'feed.id',
      'user_account.id AS userId',
      'user_account.avatar AS userImage',
      'user_account.name AS userName',
      'user_account.surname AS userSurname',
      'feed.like',
      'feed_like.id AS likeMe',
      'feed.comment',
      'feed.created AS created',
    )
    .innerJoin('user_account', 'user_account.id', '=', 'feed.userId')
    .leftJoin('feed_like', function () {
      this.on('feed_like.feedId', '=', 'feed.id').andOn('feed_like.userId', '=', user.userId);
    })
    .where('feed.id', feedId);

  const feed = rows[0];

  // users info
  const usersLanguage = await connection('user_account')
    .select('user_account.id', 'language.name as languageName', 'user_language.learn', 'user_language.native')
    .innerJoin('user_language', 'user_language.userId', '=', 'user_account.id')
    .innerJoin('language', 'user_language.languageId', '=', 'language.id')
    .where('user_account.id', feed.userId);

  const results = [];
  let userLanguage = usersLanguage.filter((x) => x.id == feed.userId);
  userLanguage = userLanguage.map((x) => ({
    languageName: x.languageName,
    learn: x.learn,
    native: x.native,
  }));

  const result = {};
  result.id = feed.id;
  result.content = feed.content;
  result.like = feed.like;
  result.numComment = feed.comment;
  result.image = feed.image != null ? `${process.env.BUCKET_ASSETS}/images/feeds/${feed.image}` : null;
  result.created_at = feed.created;
  result.likeMe = feed.likeMe != null;
  result.user = {
    id: feed.userId,
    image: `${process.env.BUCKET_ASSETS}/images/avatars/${feed.userImage}`,
    name: feed.userName,
    surname: feed.userSurname,
    languages: userLanguage,
  };
  results.push(result);

  return {
    statusCode: 200,
    body: results[0],
  };
};

exports.createFeed = async (event) => {
  const result = {};
  const { connection } = event;

  // body
  const body = JSON.parse(event.body);

  // get user
  const user = event.requestContext.authorizer;
  user.userId = Number(user.userId);

  const type = body.doubt == true ? 'doubts' : 'general';

  if (body.content.length > 140 || body.content.lenght == 0) {
    return {
      statusCode: 400,
      body: 'data-invalid',
    };
  }

  let feedId = await connection('feed').insert({ userId: user.userId, type, content: body.content }).returning('id');
  feedId = feedId[0];

  // upload image
  if (body.includeFile && ['image/jpeg', 'image/png', 'image/jpg'].includes(body.fileType)) {
    const imageName = `${feedId}/${uuidv4()}.png`;
    const params = {
      Bucket: 'app-production-assets',
      Key: `images/feeds/${imageName}`,
      Expires: 60,
      ContentType: body.fileType,
      ACL: 'public-read',
    };
    result.urlSigned = await s3.getSignedUrlPromise('putObject', params);

    connection('feed').update({ image: imageName }).where('id', feedId).then();
  }

  // transform data
  const usersLanguage = await connection('user_account')
    .select('user_account.id', 'language.name as languageName', 'user_language.learn', 'user_language.native')
    .innerJoin('user_language', 'user_language.userId', '=', 'user_account.id')
    .innerJoin('language', 'user_language.languageId', '=', 'language.id')
    .where('user_account.id', user.userId);
  let userLanguage = usersLanguage.filter((x) => x.id == user.userId);
  userLanguage = userLanguage.map((x) => ({
    languageName: x.languageName,
    learn: x.learn,
    native: x.native,
  }));

  const feed = await connection('feed')
    .select(
      'feed.image',
      'feed.content',
      'feed.id',
      'user_account.id AS userId',
      'user_account.avatar AS userImage',
      'user_account.name AS userName',
      'user_account.surname AS userSurname',
      'feed.like',
      'feed_like.id AS likeMe',
      'feed.comment',
      'feed.created AS created',
    )
    .innerJoin('user_account', 'user_account.id', '=', 'feed.userId')
    .leftJoin('feed_like', function () {
      this.on('feed_like.feedId', '=', 'feed.id').andOn('feed_like.userId', '=', user.userId);
    })
    .where('feed.id', feedId)
    .first();

  result.id = feed.id;
  result.content = feed.content;
  result.like = feed.like;
  result.numComment = feed.comment;
  result.image = feed.image != null ? `${process.env.BUCKET_ASSETS}/images/feeds/${feed.image}` : null;
  result.created_at = feed.created;
  result.likeMe = feed.likeMe != null;
  result.user = {
    userId: feed.userId,
    image: `${process.env.BUCKET_ASSETS}/images/avatars/${feed.userImage}`,
    name: feed.userName,
    surname: feed.userSurname,
    languages: userLanguage,
  };

  return {
    statusCode: 200,
    body: result,
  };
};

exports.createComment = async (event) => {
  const { connection } = event;

  // get path parameters
  const feedId = event.pathParameters.id;

  // body
  const body = JSON.parse(event.body);

  // get user
  const user = event.requestContext.authorizer;
  user.userId = Number(user.userId);

  if (body.content.length > 140 || body.content.lenght == 0) {
    return {
      statusCode: 400,
      body: 'data-invalid',
    };
  }

  let rows = await connection('feed').select('id').where('id', feedId);
  if (!rows.length) {
    return {
      statusCode: 404,
      body: 'data-invalid',
    };
  }

  const commentId = await connection('feed_comment').insert({ userId: user.userId, content: body.content, feedId }).returning('id');

  // get feed to return
  rows = connection('feed_comment')
    .select(
      'feed_comment.feedId',
      'feed_comment.content',
      'user_account.id AS userId',
      'user_account.avatar AS userImage',
      'user_account.name AS userName',
      'user_account.surname AS userSurname',
      'feed_comment.create_at AS create_at',
    )
    .innerJoin('user_account', 'user_account.id', '=', 'feed_comment.userId')
    .where('feed_comment.id', Number(commentId));
  const comments = await rows;

  // increment comment
  connection('feed').where('id', feedId).increment('comment', 1).then();

  // transform data
  const results = [];

  for (comment of comments) {
    const result = {};
    result.id = comment.feedId;
    result.content = comment.content;
    result.create_at = comment.create_at;
    result.user = {
      id: comment.userId,
      image: `${process.env.BUCKET_ASSETS}/images/avatars/${comment.userImage}`,
      name: comment.userName,
      surname: comment.userSurname,
    };
    results.push(result);
  }

  return {
    statusCode: 200,
    body: results[0],
  };
};

exports.createLike = async (event) => {
  const { connection } = event;

  // get path parameters
  const feedId = event.pathParameters.id;

  // get like boolean value
  const body = JSON.parse(event.body);

  // get user
  const user = event.requestContext.authorizer;
  user.userId = Number(user.userId);

  const rows = await connection('feed').select('id').where('id', feedId);
  if (!rows.length) {
    return {
      statusCode: 404,
      body: 'data-invalid',
    };
  }

  const like = await connection('feed_like').select('id').where('feedId', feedId).andWhere('userId', user.userId);
  const numLike = connection('feed').where('id', feedId);

  const promises = [];
  if (body.like == true) {
    if (!like.length) {
      promises.push(numLike.increment('like', 1));
      promises.push(
        connection('feed_like').insert({
          userId: user.userId,
          feedId,
        }),
      );
    }
  } else if (like.length) {
    promises.push(numLike.decrement('like', 1));
    promises.push(connection('feed_like').where('userId', user.userId).andWhere('feedId', feedId).del());
  }

  await Promise.all(promises);

  return {
    statusCode: 200,
    body: 'Created successfull',
  };
};
