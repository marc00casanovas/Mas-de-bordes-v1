
import * as XLSX from 'xlsx';

// Aquesta funció genèrica pot exportar qualsevol array d'objectes a un fitxer Excel.
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Dades') => {
  if (data.length === 0) {
    alert("No hi ha dades per exportar.");
    return;
  }
  
  // Crea un nou llibre de treball i una fulla de càlcul a partir de les dades (en format JSON).
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Genera el fitxer Excel i el descarrega al client.
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
