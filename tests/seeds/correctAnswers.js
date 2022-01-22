
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('correctAnswers').del()
    .then(function () {
      // Inserts seed entries
      return knex("correctAnswers").insert([
        { qid: 1, aid: 4 },
        { qid: 2, aid: 5 },
        { qid: 3, aid: 12 },
        { qid: 4, aid: 14 },
        { qid: 5, aid: 17 },
        { qid: 6, aid: 24 },
        { qid: 7, aid: 27 },
        { qid: 8, aid: 31 },
        { qid: 9, aid: 35 },
        { qid: 10, aid: 37 },
        { qid: 11, aid: 42 },
        { qid: 12, aid: 49 },
        { qid: 13, aid: 53 },
        { qid: 14, aid: 58 },
        { qid: 15, aid: 61 },
        { qid: 16, aid: 68 },
        { qid: 17, aid: 75 },
        { qid: 18, aid: 71 },
      ]);
    });
};

// This table matches the correct answer of the question.

// qid -> FOREIGN KEY refering to mcqQuestions(qid)
// aid -> FOREIGN KEY refering to mcqAnswers(aid)