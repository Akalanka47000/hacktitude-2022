const session = require("supertest-session");
process.env.NODE_ENV = "test";

function authenticateTestSession(testSession) {
  var username = "abby@hacktitude.io";
  var pwd = "test";
  var userId = 8;

  return new Promise((resolve, reject) => {
    testSession
      .post("/user/signin")
      .send({ email: username, password: pwd})
      .expect(302)
      .end(function (err) {
        if (err) reject(err);
        resolve(userId);
      });
  });
}

function resetDatabase(_db) {
  return new Promise(async (resolve, reject) => {
    try {
      await _db.migrate.latest().then(async () => await _db.seed.run());
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function createSuperTestSession(app) {
    return session(app);
}

function assertErrorPage(document) {
  expect(document.title).not.toBe("Error Page");
}


module.exports = {
  authenticateTestSession,
  resetDatabase,
  createSuperTestSession,
  assertErrorPage,
};
