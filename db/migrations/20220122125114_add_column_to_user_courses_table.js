
exports.up = function(knex) {
    knex.schema.table('userCourses', function(table) {
        table.integer('progress').notNullable().defaultTo(0);
    })
};

exports.down = function(knex) {
    knex.schema.table('userCourses', function(table) {
        table.dropColumn('progress')
    })
};
