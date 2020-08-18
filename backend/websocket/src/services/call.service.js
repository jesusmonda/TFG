const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'develop') dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

exports.connect = async (io, socket) => {
  const { connection } = io;

  // get user
  const { userId } = socket.decoded;

  connection('user_account').where('id', userId).update({ socketId: socket.id }).then();
};

exports.disconnect = async (io, socket) => {
  const { connection } = io;

  // get user
  const { userId } = socket.decoded;

  connection('user_account').where('id', userId).update({ socketId: null, onCall: false }).then();
};

const getUser = async (connection, userId) => {
  const user = await connection('user_account')
    .select('user_account.id AS userId', 'user_account.avatar AS userImage', 'user_account.name AS userName', 'user_account.surname AS userSurname')
    .innerJoin('user_language', 'user_language.userId', '=', 'user_account.id')
    .where('user_account.id', userId)
    .first();

  const userLanguages = await connection('user_language')
    .select('language.name AS languageName', 'user_language.learn', 'user_language.native')
    .innerJoin('language', 'user_language.languageId', '=', 'language.id')
    .where('user_language.userId', userId);

  const result = {};
  result.userId = user.userId;
  result.image = `${process.env.BUCKET_ASSETS}/images/avatars/${user.userImage}`;
  result.name = user.userName;
  result.surname = user.userSurname;
  result.languages = userLanguages;
  result.socketId = user.socketId;

  return result;
};
exports.toCall = async (io, socket, data) => {
  const { connection } = io;

  // get user
  const { userId } = socket.decoded;

  const incomingUser = await connection('user_account').select('socketId').where('id', data.userId).first();

  // available user
  if (incomingUser.socketId != null) {
    const userInfo = await getUser(connection, userId);
    socket.to(incomingUser.socketId).emit('receiveCall', { status: 100, callFrom: userInfo });
  }

  // not available user
  if (incomingUser.socketId == null) {
    socket.emit('receiveCall', { status: 400 });
  }
};

exports.answerCall = async (io, socket, data) => {
  const { connection } = io;

  const incomingUser = await connection('user_account').select('socketId').where('id', data.user.userId).first();

  const status = data.acceptCall ? 200 : 400;
  socket.to(incomingUser.socketId).emit('receiveCall', { status, roomId: data.roomId || null });
};

// status
/*
  100 = waiting call
  400 = fail call
  200 = on call
  */
