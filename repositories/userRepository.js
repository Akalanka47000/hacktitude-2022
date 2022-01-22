const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
var CryptoJS = require("crypto-js");

let _db;

function init(db) {
  _db = db;
}

const knex_db = require("../db/db-config");

function getUserByEmailAndPassword(email, password) {
  const sql = `SELECT id, name, email, password FROM users`;
  return new Promise(async (resolve, reject) => {
    knex_db
      .raw(sql)
      .then((users) => {
        users.forEach(async (user) => {
          var decrypted_email = "";
          try {
            var bytes = CryptoJS.AES.decrypt(
              user.email,
              "Hacktitude_SECRET_KEY"
            );
            decrypted_email = bytes.toString(CryptoJS.enc.Utf8);
          } catch (e) {
            console.log("Coulnd't decrypt");
          }
          if (user.email == email || decrypted_email === email) {
            if (bcrypt.compareSync(password, user.password)) {
              resolve(user);
            } else {
              reject("User authentication failed");
            }
          }
        });
        reject("User authentication failed");
      })
      .catch((error) => {
        reject("User authentication failed");
      });
  });
}

function getUserById(id) {
  const sql = `SELECT id, name, email, password FROM users WHERE id = ?`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [id])
      .then((user) => {
        resolve(user[0]);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function signUpUser(name, email, passwordOne, passwordTwo) {
  const data = {};
  return new Promise(async (resolve, reject) => {
    if (
      name.length < 1 ||
      email.length < 1 ||
      passwordOne.length < 1 ||
      passwordTwo.length < 1
    ) {
      data.error = "values missing";
      reject(data);
    } else {
      const sql = `SELECT id, name, email, password FROM users`;
        knex_db
          .raw(sql)
          .then(async (users) => {
            userExists = false;
            users.forEach(async (user) => {
              var decrypted_email = "";
              try {
                var bytes = CryptoJS.AES.decrypt(
                  user.email,
                  "Hacktitude_SECRET_KEY"
                );
                decrypted_email = bytes.toString(CryptoJS.enc.Utf8);
              } catch (e) {
                console.log("Coulnd't decrypt");
              }
              if (user.email == email || decrypted_email === email) {
                userExists = true;
              }
            });
            if (userExists) {
              data.error = "Already Registered";
              reject(data);
            } else {
              if (passwordOne != passwordTwo) {
                data.error = "User authentication failed";
                reject(data);
              } else {
                var encryptedEmail = CryptoJS.AES.encrypt(email, 'Hacktitude_SECRET_KEY').toString();
                const hashPassword = await bcrypt.hash(passwordTwo, 10);
                const sql2 = `INSERT INTO users(id, name, email, password, country_currency) VALUES(NULL,?,?,?,?)`;
                knex_db
                  .raw(sql2, [name, encryptedEmail, hashPassword, "LKR"])
                  .then(() => {
                    resolve();
                  })
                  .catch((error) => {
                    reject(error);
                  });
              }
            }
            reject("User authentication failed");
          })
          .catch((error) => {
            reject(error);
          });
    }
  });
}

function getUserCountryFlag(id) {
  const sql = `SELECT country_currency FROM users WHERE id = ?`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [id])
      .then(async (user) => {
        const url = `https://restcountries.com/v2/currency/${user[0].country_currency}`;

        const response = await fetch(url);
        const data = await response.json();

        resolve(data[0].flag);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

module.exports = {
  getUserByEmailAndPassword,
  getUserById,
  signUpUser,
  init,
  getUserCountryFlag,
};
