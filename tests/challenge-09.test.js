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

  test("Challenge 9.a - Displaying Average Score after submitting an MCQ", async () => {
    const courseId = 1;
    let res = await authenticatedSession
      .post("/course/scores/" + courseId)
      .send({
        q0_answer: 4,
        q1_answer: 5,
        q2_answer: 12,
      });
    document.documentElement.innerHTML = res.text;
    let element = document.getElementById("average-score");
    expect(parseFloat(element.innerHTML.trim())).toBe(parseFloat(10)); // 1 users, 10 total score

    //lets get two other user to complete the course 1 and recalculate

    await db("userCourses").insert([
      { uid: 2, cid: 1, score: 20 },
      { uid: 3, cid: 1, score: 20 },
    ]);

    res = await authenticatedSession.post("/course/scores/" + courseId).send({
      q0_answer: 4,
      q1_answer: 5,
      q2_answer: 12,
    });
    document.documentElement.innerHTML = res.text;
    element = document.getElementById("average-score");
    expect(parseFloat(element.innerHTML.trim())).toBe(parseFloat(17));//3 users, 50 total score
  });
});
