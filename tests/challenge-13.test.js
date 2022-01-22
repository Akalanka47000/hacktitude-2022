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

  test("Challenge 13.a - Displaying 10 books from Google Books API", async () => {
    const courseId = 4;
    const firstWord = "AWS";
    const res = await authenticatedSession.get(
      `/course/dashboard?courseId=${courseId}`
    );
    document.documentElement.innerHTML = res.text;
    const element = document.getElementById(`suggested-books-container`);
    expect(element.children.length).toBe(5);

    for (let index = 0; index < element.children.length; index++) {
      const book = element.children[index];
      expect(book.innerHTML.toLowerCase()).toContain(firstWord.toLowerCase());
    }
  });
});
