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

  test("Challenge 5.a - Disenroll button should be not Hidden", async () => {
    const res = await authenticatedSession.get("/course/dashboard?courseId=6");
    document.documentElement.innerHTML = res.text;
    const button = document.getElementById("dis-enroll-btn");
    expect(button.hidden).toBe(false);
  });

  test("Challenge 5.b - Course should get Disenrolled when the Button is Clicked", async () => {
    //enroll the current user to few courses
    await db("userCourses")
      .insert([
        { uid: authenticatedUserId, cid: 1, score: -1 },
        { uid: authenticatedUserId, cid: 3, score: -1 },
        { uid: authenticatedUserId, cid: 4, score: -1 },
      ]);

    let row = await db
      .from("userCourses")
      .count("* as count")
      .where("uid", authenticatedUserId);
    expect(row[0].count).toBe(6);
    //disenroll the user from course 1
    await authenticatedSession.get("/course/disenroll?courseId=1");
    row = await db
      .from("userCourses")
      .count("* as count")
      .where("uid", authenticatedUserId);
    expect(row[0].count).toBe(5);
  });
});
