exports.getAvailableLanguages = async (event) => {
  const { connection } = event;

  try {
    const languages = await connection('language').select('name', 'id');

    return {
      statusCode: 200,
      body: languages,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Internal error',
    };
  }
};

exports.createError = async (event) => {
  const { connection } = event;

  // body
  const body = JSON.parse(event.body);

  try {
    await connection('error').insert({ error: body.error });

    return {
      statusCode: 200,
      body: 'OK',
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Internal error',
    };
  }
};
