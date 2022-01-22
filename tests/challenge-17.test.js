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

  test("Challenge 17.a - displaying user specific converted course price", async () => {
    const courseId = 1;
    const SGD_rate = 1.34865;
    const coursePrice = 15;

    //check for user's current locale
    let res = await authenticatedSession.get(
      `/course/dashboard?courseId=${courseId}`
    );
    document.documentElement.innerHTML = res.text;
    let element = document.getElementById(`course-price`);
    let converted = parseFloat((coursePrice * SGD_rate).toFixed(2));
    expect(parseFloat(element.innerHTML.trim())).toBe(converted);

    //change user's locate to NOK and test again
    await db
      .from("users")
      .update("country_currency", "NOK")
      .where("id", authenticatedUserId);

    const NOK_rate = 8.818035;
    res = await authenticatedSession.get(
      `/course/dashboard?courseId=${courseId}`
    );
    document.documentElement.innerHTML = res.text;
    element = document.getElementById(`course-price`);
    converted = parseFloat((coursePrice * NOK_rate).toFixed(2));
    expect(parseFloat(element.innerHTML.trim())).toBe(converted);
  });
});
