import * as XLSX from 'xlsx';

export const getExcelColumnName = (index) => {
    let result = '';
    let num = index;
    while (num >= 0) {
        result = String.fromCharCode(65 + (num % 26)) + result;
        num = Math.floor(num / 26) - 1;
    }
    return result;
};

export const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

export const downloadExcelFile = (data, filename) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Datos Procesados');
    XLSX.writeFile(wb, filename);
};

export const processBaseFileData = (jsonData) => {
    // Para el archivo base, eliminar la segunda fila (índice 1)
    if (jsonData.length > 2) {
        console.log('Archivo base original tiene', jsonData.length, 'filas');
        console.log('Eliminando segunda fila:', jsonData[1]);
        const processedData = [jsonData[0], ...jsonData.slice(2)]; // Mantener header y desde la tercera fila
        console.log('Archivo base después de eliminar segunda fila tiene', processedData.length, 'filas');
        return processedData;
    }
    return jsonData;
};