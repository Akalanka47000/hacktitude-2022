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

describe("Pre authentication tasks", () => {
  test("Sanity Test - Login page works", async () => {
    const res = await testSession.get("/user/signin");
    expect(res.status).toBe(200);
    expect(res.text.includes("Login")).toBe(true);
  });

  test("Sanity Test - New user registration works", async () => {
    const res = await testSession.post("/user/signup").send({
      name: "TEST USER",
      email: "testuser@gmail.com",
      passwordOne: "test1234",
      passwordTwo: "test1234",
    });
    const users = await db.from("users").select("name");
    expect(users.length).toBe(6);
  });

  test("Sanity Test - Database reset for each test", async () => {
    const users = await db.from("users").select("name");
    expect(users.length).toBe(5);
  });
});

describe("Post authentication tasks", () => {
  var authenticatedSession = null;
  var authenticatedUserId = null;
  beforeAll(async () =>
    await testBase.authenticateTestSession(testSession).then((userId) => {
      authenticatedSession = testSession;
      authenticatedUserId = userId;
    })
  );

  test("Sanity Test - Homepage should show at least 1 popular courses", async () => {
    const res = await authenticatedSession.get("/user/home");
    expect(res.status).toBe(200);
    document.documentElement.innerHTML = res.text;
    expect(
      document.getElementById("home_recent").children.length
    ).toBeGreaterThan(0);
  });
});
