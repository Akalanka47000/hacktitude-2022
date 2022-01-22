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

  test("Challenge 14.a - Create a new column 'progress' in table 'userCourses'", async () => {
    let hasColumn = await db.schema.hasColumn("userCourses", "progress");
    expect(hasColumn).toBe(true);
  });

  test("Challenge 14.b - Updating the progress Bar", async () => {
    let hasColumn = await db.schema.hasColumn("userCourses", "progress");
    expect(hasColumn).toBe(true);

    const courseId = 6;
    const progress = 50;

    await authenticatedSession.get(
      `/course/updateProgress/${courseId}/${progress}`
    );
    const res = await authenticatedSession.get(`/course/enrolled`);
    document.documentElement.innerHTML = res.text;

    const progressElement = document.getElementById(`progress-${courseId}`);
    expect(progressElement.value).toBe(progress);

    const textElement = document.getElementById(`progress-text-${courseId}`);
    expect(parseInt(textElement.innerHTML.trim())).toBe(progress);
  });
});
