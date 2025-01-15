/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
    return knex.schema
    .createTable("groups", function (table) {
        table.increments("id").primary();
        table.string("name").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table
          .timestamp("updated_at")
          .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
        })
    .createTable("group_users", function(table){
            table
            .integer("group_id")
            .unsigned()
            .references("groups.id")
            .onUpdate("CASCADE")
            .onDelete("CASCADE");
            table
            .integer("user_id")
            .unsigned()
            .references("users.id")
            .onUpdate("CASCADE")
            .onDelete("CASCADE");
            table.integer('accept_invite').notNullable();
            table.timestamp("created_at").defaultTo(knex.fn.now());
            table
              .timestamp("updated_at")
              .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
        })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
    return knex.schema.dropTable("group_users").dropTable("groups");
};
