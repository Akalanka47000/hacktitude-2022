/**
 * This comment is required for the VS Code Jest Plugin to work.
 * @jest-environment jsdom
 */
 const app = require("../server");
 const db = require("../db/db-config");
 const testBase = require("./testBase");
 var CryptoJS = require("crypto-js");
  
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
  
   test("Challenge 16.a - Encrypting User's Email", async () => {
 
     const email = 'testUser@hotmail.com';
 
     await testSession
     .post(`/user/signup`)
     .send({
       name : 'Test User',
       email : email,
       passwordOne : 'test',
       passwordTwo : 'test'
     })
 
     let user =  await db.from("users").select('email').where('name','Test User');

     var bytes  = CryptoJS.AES.decrypt(user[0].email, 'Hacktitude_SECRET_KEY');
     var decrypted_email = bytes.toString(CryptoJS.enc.Utf8);

     expect(email).toBe(decrypted_email)

     await testSession
     .post("/user/signin")
     .send({ email: email, password: 'test' })
     .expect(302);
 
    });
  
  });
