const jwt = require('jsonwebtoken');

exports.login = async (event) => {
  // connection db
  const { connection } = event;

  // body
  const {
    socialNetwork, email, userId, name, surname,
  } = JSON.parse(event.body);
  if (!socialNetwork || !email || !userId || !name || !surname) {
    return {
      statusCode: 404,
      body: 'data-invalid',
    };
  }

  let user;
  const userData = {};
  switch (socialNetwork) {
    case 'google':
      user = await connection('user_account').select('id').where('googleId', userId).first();

      userData.name = name;
      userData.surname = surname;
      userData.googleId = userId;

      break;
  }

  // register
  if (!user) {
    await connection('user_account').insert(userData);
    if (socialNetwork == 'google') {
      user = await connection('user_account').select('id').where('googleId', userId).first();
    }
  }

  // jwt
  const access_token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  return {
    statusCode: 200,
    body: {
      access_token,
    },
  };
};
