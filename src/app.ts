import knex, { migrate, seed } from "./postgres/knex.js";
import { saveResponse, logDataDB } from "./utils/utils.js";
import { saveResponsesToSheet, flattenWarehousesData } from "#utils/googleUtils.js";

await migrate.latest();
await seed.run();

const START_DATE = new Date().toISOString().slice(0, 10);
await saveResponse(START_DATE);

const responses = await knex("responses as r")
    .leftJoin("warehouses as w", "w.response_id", "r.id")
    .select(
        "r.id",
        "r.requestDate",
        "r.dtNextBox",
        "r.dtTillMax",
        "w.boxDeliveryBase",
        "w.boxDeliveryCoefExpr",
        "w.boxDeliveryLiter",
        "w.boxDeliveryMarketplaceBase",
        "w.boxDeliveryMarketplaceCoefExpr",
        "w.boxDeliveryMarketplaceLiter",
        "w.boxStorageBase",
        "w.boxStorageCoefExpr",
        "w.boxStorageLiter",
        "w.geoName",
        "w.warehouseName",
    );

const groupedByDate: Record<string, any[]> = {};
responses.forEach((r) => {
    if (!groupedByDate[r.requestDate]) groupedByDate[r.requestDate] = [];
    groupedByDate[r.requestDate].push({
        requestDate: r.requestDate,
        dtNextBox: r.dtNextBox,
        dtTillMax: r.dtTillMax,
        warehouseList: [
            {
                boxDeliveryBase: r.boxDeliveryBase,
                boxDeliveryCoefExpr: r.boxDeliveryCoefExpr,
                boxDeliveryLiter: r.boxDeliveryLiter,
                boxDeliveryMarketplaceBase: r.boxDeliveryMarketplaceBase,
                boxDeliveryMarketplaceCoefExpr: r.boxDeliveryMarketplaceCoefExpr,
                boxDeliveryMarketplaceLiter: r.boxDeliveryMarketplaceLiter,
                boxStorageBase: r.boxStorageBase,
                boxStorageCoefExpr: r.boxStorageCoefExpr,
                boxStorageLiter: r.boxStorageLiter,
                geoName: r.geoName,
                warehouseName: r.warehouseName,
            },
        ],
    });
});

for (const date of Object.keys(groupedByDate)) {
    const flatData = groupedByDate[date].flatMap(flattenWarehousesData);
    if (flatData.length) await saveResponsesToSheet(flatData, date);
}

await logDataDB(["responses"]);
console.log("All migrations and seeds have been run");

setInterval(async () => {
    try {
        const CURRENT_DATE = new Date().toISOString().slice(0, 10);

        await saveResponse(CURRENT_DATE);

        const responses = await knex("responses as r")
            .leftJoin("warehouses as w", "w.response_id", "r.id")
            .where("r.requestDate", CURRENT_DATE)
            .select(
                "r.id",
                "r.requestDate",
                "r.dtNextBox",
                "r.dtTillMax",
                "w.boxDeliveryBase",
                "w.boxDeliveryCoefExpr",
                "w.boxDeliveryLiter",
                "w.boxDeliveryMarketplaceBase",
                "w.boxDeliveryMarketplaceCoefExpr",
                "w.boxDeliveryMarketplaceLiter",
                "w.boxStorageBase",
                "w.boxStorageCoefExpr",
                "w.boxStorageLiter",
                "w.geoName",
                "w.warehouseName",
            );

        const groupedByDate: Record<string, any[]> = {};
        responses.forEach((r) => {
            if (!groupedByDate[r.requestDate]) groupedByDate[r.requestDate] = [];
            groupedByDate[r.requestDate].push({
                requestDate: r.requestDate,
                dtNextBox: r.dtNextBox,
                dtTillMax: r.dtTillMax,
                warehouseList: [
                    {
                        boxDeliveryBase: r.boxDeliveryBase,
                        boxDeliveryCoefExpr: r.boxDeliveryCoefExpr,
                        boxDeliveryLiter: r.boxDeliveryLiter,
                        boxDeliveryMarketplaceBase: r.boxDeliveryMarketplaceBase,
                        boxDeliveryMarketplaceCoefExpr: r.boxDeliveryMarketplaceCoefExpr,
                        boxDeliveryMarketplaceLiter: r.boxDeliveryMarketplaceLiter,
                        boxStorageBase: r.boxStorageBase,
                        boxStorageCoefExpr: r.boxStorageCoefExpr,
                        boxStorageLiter: r.boxStorageLiter,
                        geoName: r.geoName,
                        warehouseName: r.warehouseName,
                    },
                ],
            });
        });

        for (const date of Object.keys(groupedByDate)) {
            const flatData = groupedByDate[date].flatMap(flattenWarehousesData);
            if (flatData.length) await saveResponsesToSheet(flatData, date);
        }

        await logDataDB(["responses"]);

        console.log(`updated sheets for ${CURRENT_DATE}`);
    } catch (err) {
        console.error("error updating sheets:", err);
    }
}, 60 * 1000); // 1 hour
