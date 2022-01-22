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


  test("Challenge 18.a - displaying course content read time", async () => {

    const courseId = 1;
    let res = await authenticatedSession.get(`/course/coursePage?courseId=${courseId}`);
    document.documentElement.innerHTML = res.text;
    const element1 = document.getElementById(`read-time-1`);
    const element2 = document.getElementById(`read-time-2`);
    const element3 = document.getElementById(`read-time-3`);

    expect(parseFloat(element1.innerHTML.trim())).toBe(14)
    expect(parseFloat(element2.innerHTML.trim())).toBe(15)
    expect(parseFloat(element3.innerHTML.trim())).toBe(8)

    //change the chapter 2 of course 1 and test
    await db("chapters")
      .update("description", "In a class, there can be several methods with the same name. However they must have a different signature. The signature of a method is comprised of its name, its parameter types and the order of its parameters. The signature of a method is not comprised of its return type nor its visibility nor the exceptions it may throw. The practice of defining two or more methods within the same class that share the same name but have different parameters is called overloading methods word word word word word word word word word word word word word word")
      .andWhere("id", 2);

    res = await authenticatedSession.get(`/course/coursePage?courseId=${courseId}`);
    document.documentElement.innerHTML = res.text;
    const element4 = document.getElementById(`read-time-2`);
    expect(parseFloat(element4.innerHTML.trim())).toBe(23)
  });

});