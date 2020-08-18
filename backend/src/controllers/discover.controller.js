exports.getPeople = async (event) => {
  const { connection } = event;

  // get user
  const user = event.requestContext.authorizer;
  user.userId = Number(user.userId);

  // my languages
  const myLanguages = await connection('user_account')
    .select('user_language.languageId', 'user_language.native', 'user_language.learn')
    .innerJoin('user_language', 'user_language.userId', '=', 'user_account.id')
    .where('user_account.id', user.userId);

  // my native language
  const myLanguagesNative = myLanguages.filter((x) => x.native == true);
  const myLanguagesLearn = myLanguages.filter((x) => x.learn == true);

  // the other way around from my native language
  const language = myLanguagesNative.map((x) => ({
    languageId: x.languageId,
    native: false,
    learn: true,
  }));
  myLanguagesLearn.map((x) => {
    language.push({ languageId: x.languageId, native: true, learn: false });
  });

  const rows = connection('user_account')
    .select('user_account.id AS userId', 'user_account.avatar AS userImage', 'user_account.name AS userName', 'user_account.surname AS userSurname')
    .innerJoin('user_language', 'user_language.userId', '=', 'user_account.id');
  // .leftJoin('user_followed', function() {
  //   this.on('user_followed.userId', '=', user.userId).andOn('user_followed.followedId', '=', 'user_account.id')
  // })
  rows.where(function () {
    language.map((x) => this.orWhere(x));
  });
  // rows.whereNull('user_followed.userId');
  rows.groupBy(
    'user_account.id',
    // 'user_followed.userId'
  );
  rows.orderByRaw('RANDOM()');

  // limit and offset
  rows.limit(15);

  const discovers = await rows;

  // transform data
  // users info
  const usersId = discovers.map((x) => x.userId);
  const usersLanguage = await connection('user_account')
    .select('user_account.id', 'language.name as languageName', 'user_language.learn', 'user_language.native')
    .innerJoin('user_language', 'user_language.userId', '=', 'user_account.id')
    .innerJoin('language', 'user_language.languageId', '=', 'language.id')
    .whereIn('user_account.id', usersId);

  const results = [];
  for (const discover of discovers) {
    let userLanguage = usersLanguage.filter((x) => x.id == discover.userId);
    userLanguage = userLanguage.map((x) => ({
      languageName: x.languageName,
      learn: x.learn,
      native: x.native,
    }));

    const result = {};
    result.user = {};
    result.user.userId = discover.userId;
    result.user.image = `${process.env.BUCKET_ASSETS}/images/avatars/${discover.userImage}`;
    result.user.name = discover.userName;
    result.user.surname = discover.userSurname;
    result.user.languages = userLanguage;
    results.push(result);
  }

  return {
    statusCode: 200,
    body: results,
  };
};
