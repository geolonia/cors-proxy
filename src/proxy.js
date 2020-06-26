const axios = require("axios");
const fetch = require("node-fetch");
const referers = require("./referers.json");

const defaultHeaders = {
  "access-control-allow-origin": "*",
};

const proxy = async (event, _0, callback) => {
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
      `^${(Origin || origin)
        .replace(".", "\\.")
        .replace("*", "[a-zA-Z0-9\\-_]+")}`,
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
        message: "Not allowed.",
      }),
    });
  }

  // proxy request
  const url = decodeURIComponent(target);
  let data, headers;
  try {
    data = await fetch(url, {
      headers: { Origin: Origin || origin },
    }).then((res) => {
      headers = res.headers.raw();
      return res.text();
    });
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
