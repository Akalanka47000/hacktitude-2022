exports.up = function (knex) {
  return knex.schema
    .createTable("users", function (table) {
      table.increments("id").notNullable().primary();
      table.string("name", 255);
      table.string("email", 255);
      table.string("password", 255);
      table.string("country_currency", 255);
    })
    .createTable("courses", function (table) {
      table.increments("id").notNullable().primary();
      table.string("title", 255);
      table.string("level", 255);
      table.string("description");
      table.int("price");
      table.int("duration");
    })
    .createTable("mcqQuestions", function (table) {
      table.increments("qid").notNullable().primary();
      table.string("questions");
    })
    .createTable("chapters", function (table) {
      table.increments("id").notNullable().primary();
      table.int("cid").notNullable().references("id").inTable("courses");
      table.string("description", 255);
      table.int("chapterno");
    })
    .createTable("mcqAnswers", function (table) {
      table.increments("aid").primary();
      table.int("qid").references("qid").inTable("mcqQuestions");
      table.string("answer", 255);
    })
    .createTable("correctAnswers", function (table) {
      table.int("aid").notNullable().references("aid").inTable("mcqAnswers");
      table.int("qid").notNullable().references("qid").inTable("mcqQuestions");
      table.primary(["aid", "qid"]);
    })
    .createTable("courseQuestions", function (table) {
      table.int("cid").notNullable().references("id").inTable("courses");
      table.int("qid").notNullable().references("qid").inTable("mcqQuestions");
      table.primary(["cid", "qid"]);
    })
    .createTable("userCourses", function (table) {
      table.int("cid").notNullable().references("id").inTable("courses");
      table.int("uid").notNullable().references("id").inTable("users");
      table.int("score");
      table.int('progress').notNullable().defaultTo(0);
      table.string("review", 255);
      table.primary(["cid", "uid"]);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable("users")
    .dropTable("courses")
    .dropTable("chapters")
    .dropTable("mcqAnswers")
    .dropTable("courseQuestions")
    .dropTable("correctAnswers")
    .dropTable("mcqQuestions")
    .dropTable("userCourses")
    .dropTable("knex_migrations_lock");
};
