
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('mcqQuestions').del()
    .then(function () {
      // Inserts seed entries
      return knex('mcqQuestions').insert([
        { qid: 1, questions: 'Which of the following is not JavaScript Data Types?'},
        { qid: 2, questions: 'Inside which HTML element do we put the JavaScript?'},
        { qid: 3, questions: 'JavaScript ignores?'},
        { qid: 4, questions: 'A variable which is declared inside a method is called a _______ variable?'},
        { qid: 5, questions: 'Two methods with the same name but with different para0meters?'},
        { qid: 6, questions: 'What are the features of an abstract class?'},
        { qid: 7, questions: 'Who developed object-oriented programming?'},
        { qid: 8, questions: 'Which of the following is not an OOPS concept?'},
        { qid: 9, questions: 'Which feature of OOPS derives the class from another class?'},
        { qid: 10, questions: 'Which of the following services are not supported by AWS Lambda?'},
        { qid: 11, questions: 'Which of the following languages is NOT supported by AWS Lambda?'},
        { qid: 12, questions: 'When was AWS Lambda first made available for general production use?'},
        { qid: 13, questions: 'Which of the following extension is used to save the Node.js files?'},
        { qid: 14, questions: 'What does the fs module stand for?'},
        { qid: 15, questions: 'Which of the following command is used to install the Node.js express module?'},
        { qid: 16, questions: 'Which of the following language is MongoDB written in?'},
        { qid: 17, questions: 'Which of the following format is supported by MongoDB?'},
        { qid: 18, questions: 'Initial release of MongoDB was in the year?'}
      ]);
    });
};

// This is the questions table. This table has the questions which are used in the mcq. 'question id' which is 'qid' is the primary key

// qid -> PRIMARY KEY
// questions -> Question text