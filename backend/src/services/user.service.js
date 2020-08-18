exports.getMyLanguages = (connection, authUserId) => connection('user_account')
  .select('user_language.languageId', 'user_language.native', 'user_language.learn')
  .innerJoin('user_language', 'user_language.userId', '=', 'user_account.id')
  .where('user_account.id', authUserId);

exports.formatterGetUserAvailable = async (connection, user) => {
  // formatter result
  const result = {
    data: {},
  };

  if (user) {
    const userLanguages = await connection('user_language')
      .select('language.name AS languageName', 'user_language.learn', 'user_language.native')
      .innerJoin('language', 'user_language.languageId', '=', 'language.id')
      .where('user_language.userId', user.userId);

    result.data.userId = user.userId;
    result.data.image = `${process.env.BUCKET_ASSETS}/images/avatars/${user.userImage}`;
    result.data.name = user.userName;
    result.data.surname = user.userSurname;
    result.data.languages = userLanguages;
    result.data.socketId = user.socketId;
  }

  return result;
};
