//TODO: need to fix the data type here ...
export async function ExportResults(
  FileFormat: FileFormat,
  data: Array<unknown>,
  fileName: string,
): Promise<boolean> {
  if (FileFormat.toUpperCase() === "CSV") {
    await exportToCsv(data, fileName);
    return true;
  } else if (FileFormat.toUpperCase() === "JSON") {
    await exportToJson(data, fileName);
    return true;
  }
  return false;
}

import converter from "json-2-csv";
import fs from "node:fs";
import { FileFormat } from ".";

async function exportToCsv(
  data: Array<unknown>,
  fileName: string,
): Promise<void> {
  const stringOuput = converter.json2csv(data as object[], {
    trimHeaderFields: true,
  });
  console.log(stringOuput);
  await fs.writeFileSync(`${fileName}.csv`, stringOuput);
}

async function exportToJson(
  data: Array<unknown>,
  fileName: string,
): Promise<void> {
  fs.writeFileSync(`${fileName}.json`, JSON.stringify(data));
}
