const AWS = require('aws-sdk');
const dotenv = require('dotenv');

const s3 = new AWS.S3();
if (process.env.NODE_ENV === 'develop') dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const joinToRoom = (io, socket, roomId) => {
  io.of('/chat')
    .in(roomId)
    .clients((error, clients) => {
      if (!clients.find((client) => client === socket.id)) socket.join(roomId);
    });
};
exports.joinRoom = async (io, socket) => {
  const { connection } = io;

  // get user
  const { userId } = socket.decoded;

  // get room
  let rooms = connection('room')
    .select('id')
    .where((row) => {
      row.where('user1Id', userId).orWhere('user2Id', userId);
    });
  rooms = await rooms;

  rooms.map((room) => joinToRoom(io, socket, room.id));
};

exports.connect = async (io, socket) => {
  const { connection } = io;

  // get user
  const { userId } = socket.decoded;

  connection('user_account').where('id', userId).update({ lastConnection: null }).then();
};

exports.disconnect = async (io, socket) => {
  const { connection } = io;

  // get user
  const { userId } = socket.decoded;

  connection('user_account').where('id', userId).update({ lastConnection: new Date() }).then();
};

exports.sendMessage = async (io, socket, data) => {
  const { connection } = io;

  // get user
  const { userId } = socket.decoded;

  // create transaction
  const trx = await connection.transaction();

  try {
    if (data.content === undefined || data.receiveeId === undefined) {
      socket.emit('send-message-response', {
        status: 400,
        message: 'data-invalid',
      });
      return;
    }

    // userId belong to roomId
    let room = await trx('room')
      .select('id')
      .where((row) => {
        row.where('user1Id', userId).andWhere('user2Id', data.receiveeId);
      })
      .orWhere((row) => {
        row.where('user1Id', data.receiveeId).andWhere('user2Id', userId);
      })
      .first();

    if (room === undefined) {
      // create room
      const [roomId] = await trx('room').insert({ user1Id: userId, user2Id: data.receiveeId }).returning('id');
      room = { id: roomId };

      // join room
      joinToRoom(io, socket, room.id);
    }

    // save message
    const sqlData = { roomId: room.id, userId, readed_at: null };
    if (data.type === 'text') {
      sqlData.type = 'text';
      sqlData.content = data.content;
    }
    if (data.type === 'audio') {
      // save audio on s3
      const params = {
        Body: data.content.buffer,
        Bucket: 'kobing-production-assets',
        Key: `audios/${room.id}/${data.content.fileName}`,
        ACL: 'public-read',
      };
      await s3.putObject(params).promise();

      sqlData.type = 'audio';
      sqlData.fileName = data.content.fileName;

      // eslint-disable-next-line no-param-reassign
      data.content = {
        fileUrl: `${process.env.BUCKET_ASSETS}/audios/${room.id}/${data.content.fileName}`,
        fileName: `${room.id}/${data.content.fileName}`,
      };
    }

    await trx('room_message').insert(sqlData);

    // commit
    await trx.commit();

    // send broadcast
    const responseData = {
      status: 200,
      type: data.type,
      roomId: room.id,
      content: data.content,
      userId,
      otherUserId: Number(data.receiveeId),
      created_at: new Date(),
    };

    io.of('/chat').to(room.id).emit('send-message-response', responseData);
  } catch (error) {
    await trx.rollback();

    socket.emit('send-message-response', {
      status: 500,
      message: 'error',
    });
  }
};
