exports.seed = function (knex) {
  return knex('userCourses').del()
    .then(function () {
      return knex("userCourses").insert([
        { uid: 1, cid: 1, score: 10 },
        { uid: 1, cid: 4, score: -1 },
        { uid: 5, cid: 1, score: -1 },
        { uid: 5, cid: 3, score: -1 },
        { uid: 5, cid: 4, score: -1 },
        { uid: 1, cid: 6, score: -1 },
        { uid: 3, cid: 4, score: -1 },
        { uid: 4, cid: 6, score: -1 },
        { uid: 5, cid: 6, score: -1 },
        { uid: 8, cid: 6, score: -1 },
        { uid: 8, cid: 2, score: -1 },
        { uid: 8, cid: 5, score: -1 },
      ]);
    });
};

// This table is used to find the courses that are enrolled by a particular user and the score they get.

// uid -> FOREIGN KEY refering to users(id)
// cid -> FOREIGN KEY refering to courses(id)
// score -> the score they get (-1 -> when enrolled before attempting the mcq)