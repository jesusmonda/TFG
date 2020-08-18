const authorizers = require('../authorizers/index');
const service = require('../services/call.service');

exports.handler = (io) => {
  try {
    // authorizers
    io.of('call').use((socket, next) => authorizers.user(socket, next));

    io.of('call').on('connect', (socket) => {
      service.connect(io, socket);

      socket.on('toCall', (data) => service.toCall(io, socket, data));
      socket.on('answerCall', (data) => service.answerCall(io, socket, data));
      socket.on('disconnect', () => service.disconnect(io, socket));
    });
  } catch (err) {
    console.error(`[Error] ${err}`);
  }
};
