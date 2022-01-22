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

  test("Challenge 6.a - Course Status should be displayed for Enrolled or Nor Enrolled", async () => {
    let courseId = 1;

    let res = await authenticatedSession.get("/course/allcourses");
    document.documentElement.innerHTML = res.text;
    expect(
      document.getElementById("course-status-" + courseId).innerHTML.trim()
    ).toBe("Not Enrolled");

    //enrol the user to course 1
    db("userCourses")
      .insert([{ uid: authenticatedUserId, cid: courseId, score: -1 }])
      .then(function (result) {});

    res = await authenticatedSession.get("/course/allcourses");
    document.documentElement.innerHTML = res.text;
    expect(
      document.getElementById("course-status-" + courseId).innerHTML.trim()
    ).toBe("Enrolled");
  });

  test("Challenge 6.a - Course Status should be displayed for Completed", async () => {
    let courseId = 3;

    let res = await authenticatedSession.get("/course/allcourses");
    document.documentElement.innerHTML = res.text;
    expect(
      document.getElementById("course-status-" + courseId).innerHTML.trim()
    ).toBe("Not Enrolled");

    //complete course 2 for the user
    await db("userCourses")
      .insert([{ uid: authenticatedUserId, cid: courseId, score: 0 }]);

    res = await authenticatedSession.get("/course/allcourses");
    document.documentElement.innerHTML = res.text;
    expect(
      document.getElementById("course-status-" + courseId).innerHTML.trim()
    ).toBe("Completed");
  });
});
