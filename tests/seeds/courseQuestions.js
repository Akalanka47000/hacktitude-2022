
exports.seed = function (knex) {
  return knex('courseQuestions').del()
    .then(function () {
      return knex('courseQuestions').insert([
        { cid: 1, qid: 1},
        { cid: 1, qid: 2},
        { cid: 1, qid: 3},
        { cid: 2, qid: 4},
        { cid: 2, qid: 5},
        { cid: 2, qid: 6},
        { cid: 3, qid: 7},
        { cid: 3, qid: 8},
        { cid: 3, qid: 9},
        { cid: 4, qid: 10},
        { cid: 4, qid: 11},
        { cid: 4, qid: 12},
        { cid: 5, qid: 13},
        { cid: 5, qid: 14},
        { cid: 5, qid: 15},
        { cid: 6, qid: 16},
        { cid: 6, qid: 17},
        { cid: 6, qid: 18},
      ]);
    });
};

//This table has the 'course id' and the 'questions id' as composite key. The questions of a particular course can be find through this table

// cid -> FOREIGN KEY refering to courses(id)
// qid -> FOREIGN KEY refering to mcqQuestions(qid)