import { z } from "zod";
import knex from "#postgres/knex.js";

export const responseSchema = z.object({
    response: z.object({
        data: z.object({
            dtNextBox: z.string(),
            dtTillMax: z.string(),
            warehouseList: z.array(
                z.object({
                    boxDeliveryBase: z.string(),
                    boxDeliveryCoefExpr: z.string(),
                    boxDeliveryLiter: z.string(),
                    boxDeliveryMarketplaceBase: z.string(),
                    boxDeliveryMarketplaceCoefExpr: z.string(),
                    boxDeliveryMarketplaceLiter: z.string(),
                    boxStorageBase: z.string(),
                    boxStorageCoefExpr: z.string(),
                    boxStorageLiter: z.string(),
                    geoName: z.string(),
                    warehouseName: z.string(),
                }),
            ),
        }),
    }),
});

export const API_URL = "https://common-api.wildberries.ru/api/v1/tariffs/box";

export async function fetchData(date?: string) {
    const queryDate = date ?? new Date().toISOString().slice(0, 10);

    const request = await fetch(`${API_URL}?date=${queryDate}`, {
        headers: {
            Authorization: process.env.API_KEY ?? "",
        },
    });

    if (!request.ok) {
        throw new Error(`request failed with status ${request.status}`);
    }

    const jsonData = await request.json();
    const responseData = await responseSchema.parseAsync(jsonData);

    return {
        requestDate: queryDate,
        ...responseData.response,
    };
}

export async function saveResponse(date?: string) {
    const data = await fetchData(date);

    const response = await knex("responses").where({ requestDate: data.requestDate }).first();

    if (response) {
        await knex("responses").where({ id: response.id }).update({
            dtNextBox: data.data.dtNextBox,
            dtTillMax: data.data.dtTillMax,
            updated_at: knex.fn.now(),
        });

        await knex("warehouses").where({ response_id: response.id }).del();

        await knex("warehouses").insert(
            data.data.warehouseList.map((wh) => ({
                response_id: response.id,
                ...wh,
            })),
        );

        console.log(`updated record (${data.requestDate})`);
    } else {
        const [newResponse] = await knex("responses")
            .insert({
                requestDate: data.requestDate,
                dtNextBox: data.data.dtNextBox,
                dtTillMax: data.data.dtTillMax,
            })
            .returning("*");

        const responseId = newResponse.id ?? newResponse;

        await knex("warehouses").insert(
            data.data.warehouseList.map((wh) => ({
                response_id: responseId,
                ...wh,
            })),
        );

        console.log(`created new record (${data.requestDate})`);
    }
}

export async function logDataDB(tables: string[]) {
    let rowsArray = [];
    for (const table of tables) {
        const rows = await knex.select("*").from(table);
        rowsArray.push(rows);
    }

    console.log(rowsArray);
}
