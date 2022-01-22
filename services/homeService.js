const dbConnection = require("../db/sqlite");
const userRepository = require("../repositories/userRepository");
const courseRepository = require("../repositories/courseRepository");

dbConnection
  .getDbConnection()
  .then((db) => {
    userRepository.init(db);
    courseRepository.init(db);
  })
  .catch((err) => {
    console.log(err);
    throw err;
  });

async function signInUser(email, password) {
  return userRepository
    .getUserByEmailAndPassword(email, password);
}

async function getUserSpecificDetailsWithId(id) {
  const noOfRecentCoursesToShow = 4;
  return new Promise(async (resolve, reject) => {
    try {
      const user = await userRepository.getUserById(id);
      const userCourses = await courseRepository.getUserCourses(id);
      const recentCourses = await courseRepository.getRecentCourses(
        noOfRecentCoursesToShow
      );
      resolve((merged = { user, userCourses, recentCourses }));
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  signInUser,
  getUserSpecificDetailsWithId,
};
