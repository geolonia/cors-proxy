const axios = require("axios");
const referers = require("./referers.json");

const defaultHeaders = {
  "Access-Control-Allow-Origin": "*",
};

const proxy = async (event, _0, callback) => {
  // check parameters
  const { target } = event.queryStringParameters || {};
  const { origin } = event.headers;

  if (!target) {
    return callback(null, {
      statusCode: 400,
      headers: defaultHeaders,
      body: JSON.stringify({
        message: `?target=${target} is not valid proxy target.`,
      }),
    });
  }

  if (!origin) {
    return callback(null, {
      statusCode: 400,
      headers: defaultHeaders,
      body: JSON.stringify({
        message: "An origin header is required.",
      }),
    });
  }

  if (!Array.isArray(referers)) {
    return callback(null, {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({
        message: "Temporary not available",
      }),
    });
  }

  // check origin
  const isMatched = referers.some((referer) => {
    const reg = new RegExp(
      `^${origin.replace(".", "\\.").replace("*", "[a-zA-Z0-9\\-_]+")}`,
      "ig"
    );
    if (referer.match(reg)) {
      return true;
    } else {
      return false;
    }
  });
  if (!isMatched) {
    return callback(null, {
      statusCode: 403,
      headers: defaultHeaders,
      body: JSON.stringify({
        message: "Not allowed",
      }),
    });
  }

  // proxy request
  let data, headers;
  try {
    const result = await axios.get(target);
    data = result.data;
    headers = result.headers;
  } catch (error) {
    console.error(error);
  }
  return callback(null, {
    statusCode: 200,
    headers: { ...headers, ...defaultHeaders },
    body: data,
  });
};

module.exports.handler = proxy;
