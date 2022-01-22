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

  test("Challenge 1.a - Improve the search to include results where search term is 'contained' in the course topic and description", async () => {
    let res = await authenticatedSession.post("/course/search").send({
      searchVal: "op",
    });
    expect(res.status).toBe(200);
    document.documentElement.innerHTML = res.text;
    expect(document.getElementById("all_courses").children.length).toBe(5);

    //search term 2
    res = await authenticatedSession.post("/course/search").send({
      searchVal: "java",
    });
    expect(res.status).toBe(200);
    document.documentElement.innerHTML = res.text;
    expect(document.getElementById("all_courses").children.length).toBe(3);
  });
});
