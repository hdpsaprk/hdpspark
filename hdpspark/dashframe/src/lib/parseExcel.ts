import { ParsedFile, SheetData } from '../types';

export async function parseExcel(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const XLSX = window.XLSX;
        const wb = XLSX.read(e.target!.result, { type: 'array' });
        const sheets: SheetData = {};
        wb.SheetNames.forEach((name: string) => {
          sheets[name] = XLSX.utils.sheet_to_json(wb.Sheets[name], {
            defval: '',
          });
        });
        resolve({ fileName: file.name, sheetNames: wb.SheetNames, sheets });
      } catch (err) {
        reject(new Error('Could not read file: ' + (err as Error).message));
      }
    };
    reader.onerror = () =>
      reject(new Error('File read failed. Please try again.'));
    reader.readAsArrayBuffer(file);
  });
}
