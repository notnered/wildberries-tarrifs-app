import knex, { migrate, seed } from "./postgres/knex.js";
import { saveResponse, logDataDB } from './utils/utils.js';

const START_DATE = new Date(Date.now()).toISOString().slice(0, 10);

await migrate.latest();
await seed.run();
await saveResponse(START_DATE);
await logDataDB(["responses"]);

console.log("All migrations and seeds have been run");

setInterval(async () => {
    const CURRENT_DATE = new Date(Date.now()).toISOString();
    await saveResponse(CURRENT_DATE);
    await logDataDB(["responses"]);
},  60 * 60 * 1000); // 1 hour