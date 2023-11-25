import * as xlsx from 'xlsx';
import dayjs from 'dayjs';
import type {ExcelTask} from 'src/types/SimpleTask';

export function parseExcelData(copiedText: string): ExcelTask[] {
  // Parse the copied text using xlsx
  const workbook = xlsx.read(copiedText, {type: 'string', bookSheets: true});

  // Assuming there's only one sheet in the workbook
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert the sheet data to JSON
  return xlsx.utils.sheet_to_json(sheet);
}

export function excelDateToJSDate(excelDate: number | string) {
  if (typeof excelDate === 'number') {
    const excelBaseDate = new Date(1899, 11, 30); // Excel's base date is December 30, 1899
    const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

    // Convert Excel date to JavaScript date
    return dayjs(
      new Date(excelBaseDate.getTime() + excelDate * millisecondsPerDay),
    );
  }
  return dayjs(excelDate);
}
