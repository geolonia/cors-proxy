const referrers = require("./referrers.json");

const defaultHeaders = {
  "access-control-allow-origin": "*",
};

const proxy = (event, _0, callback) => {
  // check parameters
  const { target } = event.queryStringParameters || {};
  const { Origin, origin } = event.headers;

  if (!target) {
    return callback(null, {
      statusCode: 400,
      headers: defaultHeaders,
      body: JSON.stringify({
        message: `?target=${target} is not valid proxy target.`,
      }),
    });
  }

  if (!Origin && !origin) {
    return callback(null, {
      statusCode: 400,
      headers: defaultHeaders,
      body: JSON.stringify({
        message: "An origin header is required.",
      }),
    });
  }

  if (!Array.isArray(referrers)) {
    return callback(null, {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({
        message: "Temporary not available",
      }),
    });
  }

  // check origin
  const isMatched = referrers.some((referer) => {
    const reg = new RegExp(
      `^${referer.replace(".", "\\.").replace("*", "[a-zA-Z0-9\\-_]+")}`,
      "ig"
    );
    if ((Origin || origin).match(reg)) {
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
        message: "Not allowed.",
      }),
    });
  }

  // proxy request
  const url = decodeURIComponent(target);

  try {
    return fetch(url, {
      headers: { Origin: Origin || origin },
    }).then((res) => {
      return res.text()
    }).then((text) => {
      return callback(null, {
        statusCode: 200,
        headers: { ...defaultHeaders, "content-type": "text/plain; charset=UTF-8" },
        body: text,
      });
    });
  } catch (error) {
    console.error(error);
    return callback(null, {
      statusCode: error.statusCode || 500,
      headers: { ...defaultHeaders, "content-type": "application/json" },
      body: JSON.stringify({ message: error.message }),
    });
  }
};

module.exports.handler = proxy;
