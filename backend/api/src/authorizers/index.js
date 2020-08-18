const jwt = require('jsonwebtoken');

// Help function to generate an IAM policy
const generatePolicy = function (principalId, effect, context, resource) {
  const authResponse = {};

  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = '*';
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }

  authResponse.context = context;

  return authResponse;
};

exports.user = (event, context, callback) => {
  try {
    const token = event.authorizationToken.replace('Bearer ', ''); // Autorization header

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    decoded.userId = Number(decoded.userId);

    callback(null, generatePolicy('user', 'Allow', decoded, event.methodArn));
  } catch (error) {
    callback('Unauthorized');
  }
};
