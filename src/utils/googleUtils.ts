import { getSheetsClient } from "../googleSheets.js";
import { responseSchema } from "./utils.js";
import { z } from "zod";

const spreadsheetId = process.env.SHEET_ID ?? "";

const HEADERS = [
    "Дата запроса", // requestDate
    "Начало действия тарифа", // dtNextBox
    "Окончание действия тарифа", // dtTillMax
    "Регион / федеральный округ", // geoName
    "Название склада", // warehouseName
    "Стоимость доставки 1-й литр (₽)", // boxDeliveryBase
    "Коэффициент доставки (%)", // boxDeliveryCoefExpr
    "Стоимость доставки следующего литра (₽)", // boxDeliveryLiter
    "Стоимость FBS доставки 1-й литр (₽)", // boxDeliveryMarketplaceBase
    "Коэффициент FBS доставки (%)", // boxDeliveryMarketplaceCoefExpr
    "Стоимость FBS доставки следующего литра (₽)", // boxDeliveryMarketplaceLiter
    "Стоимость хранения 1-го литра в день (₽)", // boxStorageBase
    "Коэффициент хранения (%)", // boxStorageCoefExpr
    "Стоимость хранения следующего литра в день (₽)", // boxStorageLiter
];

type Warehouse = z.infer<typeof responseSchema>["response"]["data"]["warehouseList"][number];
type TariffsResponse = {
    requestDate: string;
    dtNextBox: string;
    dtTillMax: string;
    warehouseList: Warehouse[];
};

export function flattenWarehousesData(response: TariffsResponse): string[][] {
    if (!response.warehouseList?.length) return [];

    const startDate = response.dtNextBox || new Date(response.requestDate).toISOString().slice(0, 10);

    return response.warehouseList
        .sort((a, b) => parseFloat(a.boxDeliveryCoefExpr) - parseFloat(b.boxDeliveryCoefExpr))
        .map((w) => [
            response.requestDate,
            startDate,
            response.dtTillMax,
            w.geoName,
            w.warehouseName,
            w.boxDeliveryBase,
            w.boxDeliveryCoefExpr,
            w.boxDeliveryLiter,
            w.boxDeliveryMarketplaceBase,
            w.boxDeliveryMarketplaceCoefExpr,
            w.boxDeliveryMarketplaceLiter,
            w.boxStorageBase,
            w.boxStorageCoefExpr,
            w.boxStorageLiter,
        ]);
}

export async function saveResponsesToSheet(values: any[], requestDate: string) {
    if (!values.length) return;

    const sheets = await getSheetsClient();
    const sheetTitle = new Date(requestDate).toLocaleDateString("fr-fr");

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    let sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === sheetTitle);

    if (!sheet) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{ addSheet: { properties: { title: sheetTitle } } }],
            },
        });
        console.log(`сreated new sheet: ${sheetTitle}`);

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetTitle}!A1`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [HEADERS] },
        });
    } else {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetTitle}!A1`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [HEADERS] },
        });
    }

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetTitle}!A2`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
    });

    console.log(`data for ${sheetTitle} saved/updated`);
}
