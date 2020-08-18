const knex = require('knex');
const controller = require('../controllers/user.controller');

const connection = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_ENDPOINT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  pool: { min: 0, max: 10 },
});

exports.handler = async (event) => {
  let res;
  try {
    // eslint-disable-next-line no-param-reassign
    event.connection = connection;

    switch (event.httpMethod) {
      case 'GET': {
        if (event.requestContext.resourcePath === '/user/{id}') {
          res = await controller.getUserProfile(event);
        } else if (event.requestContext.resourcePath === '/user/call') {
          res = await controller.getUserToCall(event);
        } else {
          const error = new Error();
          error.statusCode = 400;
          error.body = 'Bad Request';
          throw error;
        }
        break;
      }

      case 'PUT': {
        if (event.requestContext.resourcePath === '/user') {
          res = await controller.updateProfile(event);
        } else {
          const error = new Error();
          error.statusCode = 400;
          error.body = 'Bad Request';
          throw error;
        }
        break;
      }

      default: {
        const error = new Error();
        error.statusCode = 405;
        error.body = 'Method Not Allowed';
        throw error;
      }
    }

    return {
      statusCode: res.statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(res.body),
    };
  } catch (error) {
    console.error(`[Error callFunction] ${error}`);

    return {
      statusCode: error.statusCode || 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(error.body),
    };
  }
};
