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

  test("Challenge 2.a - Displaying user grade as Novice/Beginner", async () => {
    await authenticatedSession.get("/course/reset");

    //enrol for 2 courses
    await db("userCourses").insert([
      { uid: authenticatedUserId, cid: 1, score: -1 },
      { uid: authenticatedUserId, cid: 3, score: -1 },
    ]);

    let res = await authenticatedSession.get("/user/home");
    document.documentElement.innerHTML = res.text;
    let user_grade = document.getElementById("user-grade");
    expect(user_grade.innerHTML.trim()).toBe("Novice");

    //enrol for one more course
    await db("userCourses").insert([
      { uid: authenticatedUserId, cid: 4, score: -1 },
    ]);

    res = await authenticatedSession.get("/user/home");
    document.documentElement.innerHTML = res.text;
    user_grade = document.getElementById("user-grade");
    expect(user_grade.innerHTML.trim()).toBe("Beginner");
  });

  test("Challenge 2.b - Displaying user grade as Beginner", async () => {
    const res = await authenticatedSession.get("/user/home");
    document.documentElement.innerHTML = res.text;
    const user_grade = document.getElementById("user-grade");
    expect(user_grade.innerHTML.trim()).toBe("Beginner");
  });

  test("Challenge 2.c - Displaying user grade as Beginner/Expert", async () => {
    //case equal 90
    await db
      .from("userCourses")
      .update("score", 30)
      .where("uid", authenticatedUserId);

    let res = await authenticatedSession.get("/user/home");

    document.documentElement.innerHTML = res.text;
    let user_grade = document.getElementById("user-grade");
    expect(user_grade.innerHTML.trim()).toBe("Beginner");

    //enrol to another course > case more than 90
    await db("userCourses").insert([
      { uid: authenticatedUserId, cid: 1, score: 10 },
      { uid: authenticatedUserId, cid: 3, score: 20 },
    ]);

    res = await authenticatedSession.get("/user/home");

    document.documentElement.innerHTML = res.text;
    user_grade = document.getElementById("user-grade");
    expect(user_grade.innerHTML.trim()).toBe("Expert");
  });
});
