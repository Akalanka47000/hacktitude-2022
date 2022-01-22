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

  test("Challenge 7.a - Popular Courses Should not be displayed for enrolled users", async () => {
    const res = await authenticatedSession.get("/user/home");
    document.documentElement.innerHTML = res.text;
    const element = document.getElementById("popular-courses");
    expect(element).toBe(null);
  });

  test("Challenge 7.b - Popular Courses Should be Displayed before enrolling", async () => {
    //dis enroll user from all courses
    await authenticatedSession.get("/course/reset");

    const res = await authenticatedSession.get("/user/home");
    document.documentElement.innerHTML = res.text;
    const popularOrder = [
      "AWS Lambda",
      "MongoDB",
      "Javascript",
      "OOP Concepts",
    ];
    const courses = document.getElementById(
      "popular-courses-container"
    ).children;
    for (let index = 0; index < popularOrder.length; index++) {
      let innerHTML = courses[index].innerHTML;
      let expected = popularOrder[index];
      expect(innerHTML).toContain(expected);
    }
  });

  test("Challenge 7.b - CT - Popular Courses Should be Displayed before enrolling", async () => {
    // lets make Javascript the most popular
    await db("userCourses").insert([
      { uid: 2, cid: 1, score: -1 },
      { uid: 4, cid: 1, score: -1 },
      { uid: 6, cid: 1, score: -1 },
      { uid: 8, cid: 1, score: -1 },
    ]);

    //dis enroll user from all courses
    await authenticatedSession.get("/course/reset");

    const res = await authenticatedSession.get("/user/home");
    document.documentElement.innerHTML = res.text;
    const popularOrder = [
      "Javascript",
      "AWS Lambda",
      "MongoDB",
      "OOP Concepts",
    ];
    const courses = document.getElementById(
      "popular-courses-container"
    ).children;
    for (let index = 0; index < popularOrder.length; index++) {
      expect(courses[index].innerHTML).toContain(popularOrder[index]);
    }
  });
});
