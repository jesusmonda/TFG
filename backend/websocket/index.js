// eslint-disable-next-line import/no-extraneous-dependencies
const Server = require('socket.io');
const knex = require('knex');
const http = require('http');
const dotenv = require('dotenv');
const chatController = require('./src/controllers/chat.controller');
const callController = require('./src/controllers/call.controller');

// run server
const server = http.createServer();
const io = new Server(server, {
  transports: ['websocket'],
});

// enviroment
if (process.env.NODE_ENV === 'develop') dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
if (process.env.NODE_ENV === 'develop') server.listen(3000, '0.0.0.0');
else server.listen(3000);

// database
io.connection = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_ENDPOINT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  pool: { min: 2, max: 10 },
});

// controllers
chatController.handler(io);
callController.handler(io);
