const assert = require("assert");
const proxy = require("./proxy").handler;

// helpers
const createEvent = (target, origin) => {
  return {
    queryStringParameters: { target },
    headers: { origin },
  };
};
const callback = (error, result) => result;

describe("tests", () => {
  it("should return CORS header 1", async () => {
    const event = createEvent("https://exmaple.com", "https://geolonia.com");
    const { statusCode, headers } = await proxy(event, {}, callback);
    assert.equal(statusCode, 200);
    assert.equal(headers["access-control-allow-origin"], "*");
  });

  it("should return CORS header 2", async () => {
    const event = createEvent("https://exmaple.com", "http://localhost:12345");
    const { statusCode, headers } = await proxy(event, {}, callback);
    assert.equal(statusCode, 200);
    assert.equal(headers["access-control-allow-origin"], "*");
  });

  it("should return CORS header 3", async () => {
    const event = createEvent(
      "https://exmaple.com",
      "https://hoge.geolonia.com"
    );
    const { statusCode, headers } = await proxy(event, {}, callback);
    assert.equal(statusCode, 200);
    assert.equal(headers["access-control-allow-origin"], "*");
  });

  it("should fail without target", async () => {
    const event = createEvent(undefined, "https://geolonia.com");
    const { statusCode } = await proxy(event, {}, callback);
    assert.equal(statusCode, 400);
  });

  it("should fail with invalid origin", async () => {
    const event = createEvent(
      "https://exmaple.com",
      "https://evil.kamataryo.com"
    );
    const { statusCode } = await proxy(event, {}, callback);
    assert.equal(statusCode, 403);
  });
});
