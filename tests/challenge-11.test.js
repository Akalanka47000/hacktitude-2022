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

  test("Challenge 11.a - A new column called `last_resumed_date should be added in the userCourses Table", async () => {
    let hasColumn = await db.schema.hasColumn(
      "userCourses",
      "last_resumed_date"
    );
    expect(hasColumn).toBe(true);
  });

  test("Challenge 11.b - Displaying Inactive If it is more than 14 days", async () => {
    let hasColumn = await db.schema.hasColumn(
      "userCourses",
      "last_resumed_date"
    );
    expect(hasColumn).toBe(true);

    //inactive course
    const courseId1 = 6;
    await db("userCourses")
      .update("last_resumed_date", "2021-12-25")
      .where("cid", courseId1)
      .andWhere("uid", authenticatedUserId);

    //active course
    const courseId2 = 2;
    await db("userCourses")
      .update("last_resumed_date", "2022-01-10")
      .where("cid", courseId2)
      .andWhere("uid", authenticatedUserId);

    const res = await authenticatedSession.get(
      `/course/enrolled?userId=${authenticatedUserId}`
    );
    document.documentElement.innerHTML = res.text;

    //inactive course - tag shown 
    const element1 = document.getElementById(`inactive-${courseId1}`);
    expect(element1).not.toBe(null);

    //active course - tag not shown
    const element2 = document.getElementById(`inactive-${courseId2}`);
    expect(element2).toBe(null);
  });
});
