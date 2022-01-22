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

  test("Challenge 8.a - The review form is rendered only for enrolled users", async () => {
    //non enrolled course
    let res = await authenticatedSession.get("/course/dashboard?courseId=1");
    document.documentElement.innerHTML = res.text;

    //The div `comments-container` should be unhidden
    let div = document.getElementById("comments-container");
    expect(div.hidden).toBe(false);
    //how ever form shouldn't be visible
    div = document.getElementById("course-review-form");
    expect(div).toBe(null);

    // enrolled course
    res = await authenticatedSession.get("/course/dashboard?courseId=2");
    document.documentElement.innerHTML = res.text;
    div = document.getElementById("course-review-form");
    expect(div).toBeTruthy();
  });

  test("Challenge 8.b - Creating a new column in the userCourses Table.", async () => {
    let hasColumn = await db.schema.hasColumn("userCourses", "review");
    expect(hasColumn).toBe(true);
  });

  test("Challenge 8.c - Reviews can be submitted from the user interface", async () => {
    let hasColumn = await db.schema.hasColumn("userCourses", "review");
    expect(hasColumn).toBe(true);

    const courseId = 6;

    const comment1 = "This is the Review of AD";
    const user1 = "Abby Normal";

    await authenticatedSession.post("/course/review/" + courseId).send({
      user_review: comment1,
    });

    res = await authenticatedSession.get(
      "/course/dashboard?courseId=" + courseId
    );
    document.documentElement.innerHTML = res.text;
    div = document.getElementById("comments-container");
    expect(div.innerHTML).toContain(comment1);
    expect(div.innerHTML).toContain(user1);
  });
});
