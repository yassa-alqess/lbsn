import * as XLSX from 'xlsx';

/* load 'fs' for readFile and writeFile support */
// import * as fs from 'fs';
// XLSX.set_fs(fs);

// /* load 'stream' for stream support */
// import { Readable } from 'stream';
// XLSX.stream.set_readable(Readable);

// read xlsx file to json
export const readXlsx = (path: string) => {
    const workbook = XLSX.readFile(path);
    const sheet_name_list = workbook.SheetNames;
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    return data;
}

