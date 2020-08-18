exports.getRoomsByUserId = async (event) => {
  const { connection } = event;

  // get user
  const user = event.requestContext.authorizer;
  user.userId = Number(user.userId);

  const rooms = await connection('room')
    .select(
      'room.id',
      connection.raw(
        `
              CASE
                  WHEN room."user1Id" = ? THEN "userAccount2".*
                  WHEN room."user1Id" <> ? THEN "userAccount1".*
              END`,
        [user.userId, user.userId],
      ),
    )
    .innerJoin('user_account AS userAccount1', 'userAccount1.id', '=', 'room.user1Id')
    .innerJoin('user_account AS userAccount2', 'userAccount2.id', '=', 'room.user2Id')
    .where('room.user1Id', user.userId)
    .orWhere('room.user2Id', user.userId);

  // transform data
  const results = { chats: [] };
  for (room of rooms) {
    const x = room.case.replace('(', '').replace(')', '').split(',');

    const rows = await connection('room')
      .select('room_message.content', 'room_message.created_at', 'room_message.readed_at', 'room_message.userId', 'room_message.type', 'room_message.fileName')
      .innerJoin('room_message', 'room_message.roomId', '=', 'room.id')
      .where('room.id', room.id)
      .orderBy('room_message.created_at', 'DESC')
      .limit(1);
    const room_message = rows[0];

    const result = {};
    (result.roomId = room.id),
    (result.userWriter = room_message.userId),
    (result.type = room_message.type),
    (result.created_at = room_message.created_at),
    (result.readed_at = room_message.readed_at),
    (result.user = {
      id: x[0],
      name: x[1].replace('"', '').replace('"', ''),
      surname: x[2].replace('"', '').replace('"', ''),
      image: `${process.env.BUCKET_ASSETS}/images/avatars/${x[3]}`,
    });
    if (room_message.type == 'text') result.content = room_message.content;
    if (room_message.type == 'audio') {
      result.content = {
        fileName: room_message.fileName,
        fileUrl: `${process.env.BUCKET_ASSETS}/audios/${room.id}/${room_message.fileName}`,
      };
    }
    results.chats.push(result);
  }

  return {
    statusCode: 200,
    body: results,
  };
};

exports.getMessageRoom = async (event) => {
  const { connection } = event;

  // get user
  const user = event.requestContext.authorizer;
  user.userId = Number(user.userId);

  // get roomId
  const { receiveeId } = event.pathParameters;

  // get query parameters
  const { page = 0 } = event.queryStringParameters || {};

  let room = await connection('room')
    .select(
      'room.id',
      connection.raw(
        `
      CASE
          WHEN room."user1Id" = ? THEN "userAccount2".*
          WHEN room."user1Id" <> ? THEN "userAccount1".*
      END`,
        [user.userId, user.userId],
      ),
    )
    .innerJoin('user_account AS userAccount1', 'userAccount1.id', '=', 'room.user1Id')
    .innerJoin('user_account AS userAccount2', 'userAccount2.id', '=', 'room.user2Id')
    .where(function () {
      this.where('room.user1Id', user.userId).andWhere('room.user2Id', receiveeId);
    })
    .orWhere(function () {
      this.where('room.user1Id', receiveeId).andWhere('room.user2Id', user.userId);
    })
    .first();
  if (room === undefined) {
    const userReceived = await connection('user_account').where('id', receiveeId).first();
    return {
      statusCode: 200,
      body: {
        userReceived: {
          id: userReceived.id,
          name: userReceived.name,
          surname: userReceived.surname,
          lastConnection: userReceived.lastConnection == null ? null : new Date(userReceived.lastConnection),
          image: `${process.env.BUCKET_ASSETS}/images/avatars/${userReceived.avatar}`,
        },
        data: [],
      },
    };
  }
  room = {
    id: room.id,
    case: room.case.replace('(', '').replace(')', '').split(','),
  };

  const messages = await connection('room_message')
    .select('room_message.content', 'room_message.created_at', 'room_message.userId', 'room_message.type', 'room_message.fileName')
    .where('roomId', room.id)
    .orderBy('room_message.created_at', 'DESC')
    .limit(15)
    .offset(page * 15);

  // transform data
  const lastConnection = room.case[5] == null ? null : new Date(room.case[5].replace(')', '').replace('"', '').replace('"', ''));
  const results = {
    userReceived: {
      id: room.case[0],
      name: room.case[1].replace('"', '').replace('"', ''),
      surname: room.case[2].replace('"', '').replace('"', ''),
      lastConnection,
      image: `${process.env.BUCKET_ASSETS}/images/avatars/${room.case[3]}`,
    },
    data: [],
  };

  for (message of messages) {
    const result = {};
    result.created_at = message.created_at;
    result.userId = message.userId;
    result.type = message.type;
    if (message.type == 'text') result.content = message.content;
    if (message.type == 'audio') {
      result.content = {
        fileName: message.fileName,
        fileUrl: `${process.env.BUCKET_ASSETS}/audios/${room.id}/${message.fileName}`,
      };
    }
    results.data.push(result);
  }

  return {
    statusCode: 200,
    body: results,
  };
};

exports.readChatMessage = async (event) => {
  const { connection } = event;

  // get user
  const user = event.requestContext.authorizer;
  user.userId = Number(user.userId);

  // get roomId
  const { receiveeId } = event.pathParameters;

  const room = await connection('room')
    .select('room.id')
    .innerJoin('user_account AS userAccount1', 'userAccount1.id', '=', 'room.user1Id')
    .innerJoin('user_account AS userAccount2', 'userAccount2.id', '=', 'room.user2Id')
    .where(function () {
      this.where('room.user1Id', user.userId).andWhere('room.user2Id', receiveeId);
    })
    .orWhere(function () {
      this.where('room.user1Id', receiveeId).andWhere('room.user2Id', user.userId);
    })
    .first();
  if (room == undefined) {
    return {
      statusCode: 404,
      body: 'room-invalid',
    };
  }

  await connection('room_message').select('id').where('roomId', room.id).where('userId', '<>', user.userId)
    .whereNull('readed_at')
    .update({ readed_at: new Date() });

  return {
    statusCode: 200,
    body: 'Update successfull',
  };
};
