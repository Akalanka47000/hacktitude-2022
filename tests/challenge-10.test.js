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

  test("Challenge 10.a - Tag courses as 'Popular' if they are within the most enrolled 50% of the courses.", async () => {
    let res = await authenticatedSession.get("/course/allcourses");
    document.documentElement.innerHTML = res.text;

    var popular = [6, 4];
    var notPopular = [1, 2, 3, 5];

    for (var i = 0; i < popular.length; i++) {
      var popularId = popular[i];
      const element = document.getElementById(`course-card-` + popularId);
      expect(element.innerHTML.indexOf("POPULAR")).toBeGreaterThanOrEqual(1);
    }

    for (var i = 0; i < notPopular.length; i++) {
      var notPopularId = notPopular[i];
      const element = document.getElementById(`course-card-` + notPopularId);
      expect(element.innerHTML.indexOf("POPULAR")).toBeLessThanOrEqual(0);
    }

    //make course 2 one of the most popular and test again
    await db("userCourses").insert([
      { uid: 1, cid: 2, score: -1 },
      { uid: 2, cid: 2, score: -1 },
      { uid: 3, cid: 2, score: -1 },
    ]);

    var popularNew = [6, 2];
    var notPopularNew = [1, 4, 3, 5];

    res = await authenticatedSession.get("/course/allcourses");
    document.documentElement.innerHTML = res.text;

    for (var i = 0; i < popularNew.length; i++) {
      var popularId = popularNew[i];
      const element = document.getElementById(`course-card-` + popularId);
      expect(element.innerHTML.indexOf("POPULAR")).toBeGreaterThanOrEqual(1);
    }

    for (var i = 0; i < notPopularNew.length; i++) {
      var notPopularId = notPopularNew[i];
      const element = document.getElementById(`course-card-` + notPopularId);
      expect(element.innerHTML.indexOf("POPULAR")).toBeLessThanOrEqual(0);
    }
  });
});
