/**
 * This comment is required for the VS Code Jest Plugin to work.
 * @jest-environment jsdom
 */

const app = require("../server");
const db = require("../db/db-config");
const testBase = require("./testBase");

var testSession = null;

/**
 * Create a super test session and initiate the database before running tests.
 */
beforeAll(async () => {
  testSession = testBase.createSuperTestSession(app);
  await testBase.resetDatabase(db);
});

/**
 * Reset the database after every test case
 */
afterEach(async () => {
  await testBase.resetDatabase(db);
});

/**
 * Take down the app once test execution is done
 */
afterAll((done) => {
  app.close(done);
});

describe("Post authentication tasks", () => {
  var authenticatedSession = null;
  var authenticatedUserId = null;
  beforeAll(
    async () =>
      await testBase.authenticateTestSession(testSession).then((userId) => {
        authenticatedSession = testSession;
        authenticatedUserId = userId;
      })
  );

  test("Challenge 3.a - Numbers of enrollments should be displayed in the course dashboard", async () => {
    var courseId = 1;
    let res = await authenticatedSession.get(
      "/course/dashboard?courseId=" + courseId
    );
    document.documentElement.innerHTML = res.text;
    let div = document.getElementById("students-enrolled");
    expect(div).not.toBeNull();
    expect(parseInt(div.innerHTML)).toBe(2);

    //enroll another user and test again
    await db("userCourses").insert([
      { uid: authenticatedUserId, cid: 1, score: 10 },
    ]);
    res = await authenticatedSession.get(
      "/course/dashboard?courseId=" + courseId
    );
    document.documentElement.innerHTML = res.text;
    div = document.getElementById("students-enrolled");
    expect(div).not.toBeNull();
    expect(parseInt(div.innerHTML)).toBe(3);
  });
});
