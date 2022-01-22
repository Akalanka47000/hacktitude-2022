const bcrypt = require("bcrypt");
const fetch = require("node-fetch");

let _db;

function init(db) {
  _db = db;
}

const knex_db = require('../db/db-config')

function getUserByEmailAndPassword(email, password) {
  const sql = `SELECT id, name, email, password FROM users WHERE email = ?`;

  return new Promise(async (resolve, reject) => {
    knex_db.raw(sql, [email])
      .then((data) => {
        if (bcrypt.compareSync(password, data[0].password)) {
          resolve(data[0]);
        } else {
          reject("Password Mismatch");
        }
      })
      .catch((error) => {
        reject("User Not Found");
      })
  });
}

function getUserById(id) {
  const sql = `SELECT id, name, email, password FROM users WHERE id = ?`;

  return new Promise((resolve, reject) => {
    knex_db.raw(sql, [id])
      .then((user) => {
        resolve(user[0])
      })
      .catch((error) => {
        reject(error)
      })
  });
}

function signUpUser(name, email, passwordOne, passwordTwo) {

  const sql1 = `SELECT id, name, email, password FROM users WHERE email = ?`;

  return new Promise(async (resolve, reject) => {
    const data = {};

    if (
      name.length < 1 ||
      email.length < 1 ||
      passwordOne.length < 1 ||
      passwordTwo.length < 1
    ) {
      data.error = "values missing";
      reject(data);
    } else {
      knex_db.raw(sql1, [email])
        .then(async (user) => {
          if (!(user[0] == undefined)) {
            data.error = "Already Registered";
            reject(data)
          } else {
            if (passwordOne != passwordTwo) {
              data.error = "Passwords Mismatch";
              reject(data)
            } else {
              const hashPassword = await bcrypt.hash(passwordTwo, 10);
              const sql = `INSERT INTO users(id, name, email, password, country_currency) VALUES(NULL,?,?,?,?)`;
              knex_db.raw(sql, [name, email, hashPassword,"LKR"])
                .then(() => {
                  resolve();
                })
                .catch((error) => {
                  reject(error)
                })
            }
          }
        })
        .catch((error) => {
          reject(error)
        })
    }
  });
}

function getUserCountryFlag(id) {
  const sql = `SELECT country_currency FROM users WHERE id = ?`;

  return new Promise((resolve, reject) => {
    knex_db.raw(sql, [id])
      .then(async (user) => {

        const url = `https://restcountries.com/v2/currency/${user[0].country_currency}`

        const response = await fetch(url);
        const data = await response.json();

        resolve(data[0].flag)
      })
      .catch((error) => {
        reject(error)
      })
  });
}

module.exports = {
  getUserByEmailAndPassword,
  getUserById,
  signUpUser,
  init,
  getUserCountryFlag
};
