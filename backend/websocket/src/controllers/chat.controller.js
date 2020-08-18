const authorizers = require('../authorizers/index');
const service = require('../services/chat.service');

exports.handler = (io) => {
  try {
    // authorizers
    io.of('chat').use((socket, next) => authorizers.user(socket, next));

    io.of('chat').on('connect', (socket) => {
      service.connect(io, socket);

      socket.on('joinRoom', () => service.joinRoom(io, socket));
      socket.on('send-message', (data) => service.sendMessage(io, socket, data));
      socket.on('disconnect', () => service.disconnect(io, socket));
    });
  } catch (err) {
    console.error(`[Error] ${err}`);
  }
};
