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

 
   test("Challenge 15.a - REST API to get all the courses", async () => {
     const res = await testSession.get(`/course/getHacktitudeCourses`)
     const data = res.body;
 
     expect(data.courses.length).toBe(6);
     expect(data.courses[0].title).toBe('AWS Lambda');
     expect(data.courses[5].title).toBe('OOP Concepts');
    });
 
    test("Challenge 15.b - REST API to get the courses with specified count", async () => {
     const res = await testSession.get(`/course/getHacktitudeCourses?maxResults=3`)
     const data = res.body;
 
     expect(data.courses.length).toBe(3);
     expect(data.courses[0].title).toBe('AWS Lambda');
     expect(data.courses[2].title).toBe('Javascript');
    });
 
    test("Challenge 15.c - REST API to get the courses according to title search", async () => {
     const res = await testSession.get(`/course/getHacktitudeCourses?title=o`)
     const data = res.body;
 
     expect(data.courses.length).toBe(4);
     expect(data.courses[0].title).toBe('DotNET Basics');
     expect(data.courses[3].title).toBe('OOP Concepts');
    });
  
  });