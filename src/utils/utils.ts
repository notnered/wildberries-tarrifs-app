import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const responseSchema = z.object({
    response: z.object({
        data: z.object({
            dtNextBox: z.string(),
            dtTillMax: z.string(),
            warehouseList: z.array(z.object({
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
            }))
        })
    })
});

export const API_URL = 'https://common-api.wildberries.ru/api/v1/tariffs/box';

export async function fetchData() {
    const todayDate = new Date().toISOString().slice(0, 10);
    const request = await fetch(`${API_URL}?date=${todayDate}`, {
        headers: {
            Authorization: process.env.API_KEY ?? ''
        }
    });

    if (!request.ok) {
        throw new Error(`Request failed with status ${request.status}`);
    }
    
    const jsonData = await request.json();
    const responseData = await responseSchema.parseAsync(jsonData);
    console.log(responseData.response);
    return responseData.response;
};