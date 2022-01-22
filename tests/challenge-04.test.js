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

  test("Challenge 4.a - Sort by Popularity button should be visible", async () => {
    const res = await authenticatedSession.get(
      "/course/sort?criteria=sort_popularity"
    );

    document.documentElement.innerHTML = res.text;
    const button = document.getElementById("sort-by-popularity");

    expect(button.hidden).toBe(false);
  });

  test("Challenge 4.b - Courses sorted by Popularity should be displayed", async () => {
    const res = await authenticatedSession.get(
      "/course/sort?criteria=sort_popularity"
    );

    document.documentElement.innerHTML = res.text;
    const popularOrder = [
      "MongoDB",
      "AWS Lambda",
      "Javascript",
      "DotNET Basics",
    ];
    const courses = document.getElementById("all_courses").children;
    for (let index = 0; index < popularOrder.length; index++) {
      expect(courses[index].innerHTML).toContain(popularOrder[index]);
    }
  });

  test("Challenge 4.b - Courses sorted by Popularity - when 2 courses have same # of enrollments", async () => {
    //dis enroll current user from all courses fo that MongoDB and AWS Lambda has same number of enrollments
    await authenticatedSession.get("/course/reset");

    const res = await authenticatedSession.get(
      "/course/sort?criteria=sort_popularity"
    );

    document.documentElement.innerHTML = res.text;
    const popularOrder = [
      "AWS Lambda",
      "MongoDB",
      "Javascript",
      "OOP Concepts",
    ];
    const courses = document.getElementById("all_courses").children;
    for (let index = 0; index < popularOrder.length; index++) {
      expect(courses[index].innerHTML).toContain(popularOrder[index]);
    }
  });
});
