const jwt = require('jsonwebtoken');

exports.user = (socket, next) => {
  try {
    const { token } = socket.handshake.query;
    // eslint-disable-next-line no-param-reassign
    socket.decoded = jwt.verify(token, process.env.JWT_SECRET);

    return next();
  } catch (error) {
    return next(new Error('Authentication error'));
  }
};
