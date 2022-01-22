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

  test("Challenge 12.a - Not rendering the pin element when the course is not enrolled", async () => {
    const courseId = 1;
    const res = await authenticatedSession.get(
      `/course/dashboard?courseId=${courseId}`
    );
    document.documentElement.innerHTML = res.text;
    const element = document.getElementById(`pin`);

    expect(element).toBe(null);
  });

  test("Challenge 12.b - A new column called 'pinned' should be added in the userCourses Table", async () => {
    let hasColumn = await db.schema.hasColumn("userCourses", "pinned");
    expect(hasColumn).toBe(true);
  });

  test("Challenge 12.c - When the pin icon is clicked, `pinned` should be updated as `true`", async () => {
    let hasColumn = await db.schema.hasColumn("userCourses", "pinned");
    expect(hasColumn).toBe(true);

    const courseId = 6;
    await authenticatedSession.get(`/course/pin/${courseId}`);

    let row = await db
      .from("userCourses")
      .select("pinned")
      .where("uid", authenticatedUserId)
      .andWhere("cid", courseId);
    expect(row[0].pinned).toBe(1);

    //click once more and test the toggling feature
    await authenticatedSession.get(`/course/pin/${courseId}`);

    row = await db
      .from("userCourses")
      .select("pinned")
      .where("uid", authenticatedUserId)
      .andWhere("cid", courseId);
    expect(row[0].pinned).toBe(0);
  });

  test("Challenge 12.d - Only the pinned courses should display the pin", async () => {
    let hasColumn = await db.schema.hasColumn("userCourses", "pinned");
    expect(hasColumn).toBe(true);

    //pin the enrolled course
    const courseId1 = 6;
    await authenticatedSession.get(`/course/pin/${courseId1}`);

    //enroll to the course but do not pin it
    const courseId2 = 1;
    await authenticatedSession.get(`/course/enroll?courseId=${courseId2}`);

    let res = await authenticatedSession.get(`/course/enrolled`);
    document.documentElement.innerHTML = res.text;

    let pinned_element = document.getElementById(`pin-${courseId1}`);
    let unpinned_element = document.getElementById(`pin-${courseId2}`);

    expect(pinned_element).not.toBe(null);
    expect(unpinned_element).toBe(null);

    //un pin the course 6 also
    await authenticatedSession.get(`/course/pin/${courseId1}`);
    res = await authenticatedSession.get(`/course/enrolled`);
    document.documentElement.innerHTML = res.text;

    unpinned_element = document.getElementById(`pin-${courseId1}`);
    expect(unpinned_element).toBe(null);
  });
});
