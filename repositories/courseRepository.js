const fetch = require("node-fetch");

let _db;

function init(db) {
  _db = db;
}

const knex_db = require("../db/db-config");

function getRecentCourses(count) {
  const sql = `SELECT * from courses ORDER BY id DESC LIMIT ?`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [count])
      .then((courses) => {
        resolve(courses);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getAllCourses(userId) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id, title, level FROM courses`;
    knex_db
      .raw(sql)
      .then((courses) => {
        const sql = `SELECT cid, score FROM userCourses WHERE uid = :userId`;
        knex_db
          .raw(sql, { userId: userId })
          .then(async (userCourses) => {
            let popularCourses = await getSortedCourses("sort", "popularity")
            const twentyPercentCount =  Math.ceil(popularCourses.length * 0.2);
            popularCourses  = popularCourses.slice(0, twentyPercentCount);
            const transformedCourses = courses.map((course) => {
              if (
                userCourses.filter((userCourse) => course.id === userCourse.cid)
                  .length > 0
              ) {
                if (
                  userCourses.filter(
                    (userCourse) => course.id == userCourse.cid
                  )[0].score > -1
                ) {
                  course.status = "Completed";
                } else {
                  course.status = "Enrolled";
                }
              } else {
                course.status = "Not Enrolled";
              }
              if (popularCourses.filter((popularCourse) => course.id === popularCourse.cid).length > 0) {
                course.popularStatus = 'POPULAR'
              }
              return course;
            });
            resolve(transformedCourses);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getUserCourses(userID) {
  const sql = `SELECT * from userCourses WHERE uid = ?`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [userID])
      .then((courses) => {
        const injectedString = courses.map((c) => `'${c.cid}'`).join(", ");
        const sql2 = `SELECT courses.id, courses.title, userCourses.score, userCourses.last_resumed_date FROM courses INNER JOIN userCourses WHERE id IN (${injectedString}) AND courses.id == userCourses.cid AND userCourses.uid = ?`;

        knex_db
          .raw(sql2, [userID])
          .then((courses) => {
            resolve(courses);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getSearchedCourses(userID, searchVal) {
  return new Promise((resolve, reject) => {
    const sql2 = `SELECT title, level FROM courses WHERE title LIKE :searchVal OR description LIKE :searchVal`;

    knex_db
      .raw(sql2, {
        searchVal: "%" + searchVal + "%",
      })
      .then((courses) => {
        resolve(courses);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getSortedCourses(action, value) {
  let sql = `SELECT id, title, level FROM courses`;

  return new Promise((resolve, reject) => {
    if (action == "sort") {
      if (value == "name") {
        sql = `SELECT id, title, level FROM courses ORDER BY title`;
      }
      if (value == "popularity") {
        sql = `SELECT c.id, c.title, c.level, uc.cid, COUNT(uc.uid) FROM courses c, userCourses uc  WHERE c.id=uc.cid GROUP BY uc.cid ORDER BY COUNT(uc.uid) DESC, c.title`;
      }
      knex_db
        .raw(sql)
        .then((courses) => {
          resolve(courses);
        })
        .catch((error) => {
          reject(error);
        });
    } else if (action == "filter") {
      sql = `SELECT id, title, level FROM courses WHERE level = ? ORDER BY title`;
      knex_db
        .raw(sql, [value])
        .then((courses) => {
          resolve(courses);
        })
        .catch((error) => {
          reject(error);
        });
    } else {
      knex_db
        .raw(sql)
        .then((courses) => {
          resolve(courses);
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
}

function getCourseDetails(userId, courseId) {
  const sql = `SELECT * FROM courses WHERE id = ?`;
  const sql2 = `SELECT uid FROM userCourses WHERE cid = ? AND uid = ?`;
  const sql3 = `SELECT COUNT(cid) AS count FROM userCourses WHERE cid = ?`;
  const sql4 = `SELECT u.name, c.review FROM userCourses c, users u WHERE c.uid = u.id AND c.cid = ?`;

  return new Promise(async (resolve, reject) => {
    let enrolled = "";
    var registeredCourses = await knex_db.raw(sql2, [courseId, userId]);
    var coursesCount = await knex_db.raw(sql3, [courseId]);
    var reviews = await knex_db.raw(sql4, [courseId]);
    let ecount = coursesCount[0].count;
    if (registeredCourses.length > 0) {
      enrolled = "yes";
    } else {
      enrolled = "no";
    }

    knex_db
      .raw(sql, [courseId])
      .then((courses) => {
        let course = courses[0]
        resolve({ course, enrolled, ecount, reviews });
      }).catch((error) => {
        reject(error)
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function enrollInCourse(userId, courseId) {
  const sql = `INSERT INTO userCourses(cid,uid,score) VALUES(?,?,-1)`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [courseId, userId])
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function disenrollCourse(userId, courseId) {
  const sql = `DELETE FROM userCourses WHERE uid = :userId AND cid=:courseId;`;
  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, { courseId: courseId, userId: userId })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getCourseContentDetails(courseId) {
  const sql = `SELECT id, title, level, description, duration FROM courses WHERE id = ?`;
  const sql1 = `SELECT description , id FROM chapters WHERE cid = ?`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [courseId])
      .then((course_data) => {
        knex_db
          .raw(sql1, [courseId])
          .then((chapters_data) => {
            let course = course_data[0];
            let chapters = chapters_data;
            resolve({ course, chapters });
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function resetEnrolledCourses(userId) {
  const sql = `DELETE FROM userCourses WHERE uid = ?`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [userId])
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getCourseMcq(courseId) {
  const sql1 = `SELECT qid FROM courseQuestions WHERE cid = ?`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql1, [courseId])
      .then((data) => {
        const injectedString = data.map((c) => `'${c.qid}'`).join(", ");
        const sql2 = `SELECT qid, questions FROM mcqQuestions WHERE qid IN (${injectedString}) `;

        knex_db
          .raw(sql2)
          .then((questions) => {
            const injectedString = data.map((c) => `'${c.qid}'`).join(", ");
            const sql3 = `SELECT qid, answer, aid FROM mcqAnswers WHERE qid IN (${injectedString})`;

            knex_db
              .raw(sql3)
              .then((answers) => {
                resolve({ questions, answers });
              })
              .catch((error) => {
                reject(error);
              });
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function setCourseScore(courseId, userId, ans1, ans2, ans3) {
  const sql1 = `SELECT qid FROM courseQuestions WHERE cid = ?`;
  const sql3 = `UPDATE userCourses SET score = ? WHERE (cid = ? AND uid = ?)`;
  const sql4 = `SELECT score FROM userCourses WHERE (cid = ? AND uid = ?)`;

  let score = 0;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql1, [courseId])
      .then((data) => {
        const injectedString = data.map((q) => `'${q.qid}'`).join(", ");
        const sql2 = `SELECT aid FROM correctAnswers WHERE qid IN (${injectedString})`;

        knex_db
          .raw(sql2)
          .then((data) => {
            if (ans1 == Object.values(data[0])) {
              score = score + 10;
            }
            if (ans2 == Object.values(data[1])) {
              score = score + 10;
            }
            if (ans3 == Object.values(data[2])) {
              score = score + 10;
            }

            knex_db
              .raw(sql3, [score, courseId, userId])
              .then(() => {
                knex_db
                  .raw(sql4, [courseId, userId])
                  .then(() => {
                    resolve(score);
                  })
                  .catch((error) => {
                    reject(error);
                  });
              })
              .catch((error) => {
                reject(error);
              });
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getCourseAvgScore(courseId) {
  const sql = `SELECT score FROM userCourses WHERE cid = :courseId `;
  let score = 0;
  let count = 0;
  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, { courseId: courseId })
      .then((data) => {
        data.forEach((d) => {
          if(d.score>0){
            score+=d.score
            count++
          }
        })
        resolve(Math.round(score/count));
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function addReview(courseId, userId, review) {
  const sql1 = `SELECT cid FROM userCourses WHERE cid = ? AND uid = ?`;
  const sql2 = `UPDATE userCourses SET review = ? WHERE (cid = ? AND uid = ?)`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql1, [courseId, userId])
      .then((data) => {
        if(data.length > 0) {
          knex_db
          .raw(sql2, [review, courseId, userId])
          .then(() => {
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function resumeLearning(courseId, userId) {
  const sql1 = `SELECT cid FROM userCourses WHERE cid = ? AND uid = ?`;
  const sql2 = `UPDATE userCourses SET last_resumed_date = ? WHERE (cid = ? AND uid = ?)`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql1, [courseId, userId])
      .then((data) => {
        if(data.length > 0) {
          knex_db
          .raw(sql2, [new Date().toISOString().slice(0, 10), courseId, userId])
          .then(() => {
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getHacktitudeCourses(maxResults) {
  const sql = `SELECT title, description FROM courses LIMIT ?`;
  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [maxResults])
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

module.exports = {
  getAllCourses,
  getUserCourses,
  getSearchedCourses,
  getSortedCourses,
  getCourseDetails,
  enrollInCourse,
  disenrollCourse,
  getCourseContentDetails,
  resetEnrolledCourses,
  getCourseMcq,
  setCourseScore,
  getCourseAvgScore,
  getRecentCourses,
  init,
  addReview,
  resumeLearning,
  getHacktitudeCourses,
};
