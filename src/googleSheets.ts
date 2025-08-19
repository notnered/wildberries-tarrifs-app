import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultKeyPath = path.join(__dirname, "../src/config/google-private-key.json");
const KEYFILEPATH = process.env.GOOGLE_KEYFILE || defaultKeyPath;

if (!fs.existsSync(KEYFILEPATH)) {
  throw new Error(
    `Google key file not found at ${KEYFILEPATH}. ` +
    `Set GOOGLE_KEYFILE env variable or place the JSON key at src/config/google-private-key.json`
  );
}

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });

  return google.sheets({ version: "v4", auth });
}

export default getSheetsClient;
