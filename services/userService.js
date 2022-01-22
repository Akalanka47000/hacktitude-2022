const dbConnection = require('../db/sqlite');
const userRepository = require('../repositories/userRepository');

dbConnection
  .getDbConnection()
  .then((db) => {
    userRepository.init(db);
  })
  .catch((err) => {
    console.log(err);
    throw err;
  });

async function signUpUser(name, email, passwordOne, passwordTwo) {
  return userRepository.signUpUser(name, email, passwordOne, passwordTwo);
}

async function userFlag(userId) {
  return userRepository.getUserCountryFlag(userId);
}

module.exports = {
  signUpUser,
  userFlag
}