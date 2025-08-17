/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    await knex.schema.createTable("responses", (table) => {
        table.increments("id").primary();
        table.date("requestDate").notNullable().unique();
        table.string("dtNextBox").notNullable();
        table.string("dtTillMax").notNullable();
        table.timestamps(true, true);
    });

    await knex.schema.createTable("warehouses", (table) => {
        table.increments("id").primary();

        table.integer("response_id").unsigned().references("id").inTable("responses").onDelete("CASCADE");

        table.string("boxDeliveryBase").notNullable();
        table.string("boxDeliveryCoefExpr").notNullable();
        table.string("boxDeliveryLiter").notNullable();
        table.string("boxDeliveryMarketplaceBase").notNullable();
        table.string("boxDeliveryMarketplaceCoefExpr").notNullable();
        table.string("boxDeliveryMarketplaceLiter").notNullable();
        table.string("boxStorageBase").notNullable();
        table.string("boxStorageCoefExpr").notNullable();
        table.string("boxStorageLiter").notNullable();
        table.string("geoName").notNullable();
        table.string("warehouseName").notNullable();

        table.timestamps(true, true);
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    await knex.schema.dropTableIfExists("warehouses");
    await knex.schema.dropTableIfExists("responses");
}
