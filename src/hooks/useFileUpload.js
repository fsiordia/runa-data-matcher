import { useState } from 'react';
import { readExcelFile, processBaseFileData } from '../utils/excelUtils.js';

export const useFileUpload = () => {
    const [baseFile, setBaseFile] = useState(null);
    const [sourceFile, setSourceFile] = useState(null);
    const [baseFileData, setBaseFileData] = useState(null);
    const [sourceFileData, setSourceFileData] = useState(null);

    const handleFileUpload = async (file, type) => {
        try {
            let jsonData = await readExcelFile(file);

            // Para el archivo base, eliminar la segunda fila (índice 1)
            if (type === 'base') {
                jsonData = processBaseFileData(jsonData);
                setBaseFile(file);
                setBaseFileData(jsonData);
                return { success: true, step: 2 };
            } else {
                setSourceFile(file);
                setSourceFileData(jsonData);
                return { success: true, step: 3 };
            }
        } catch (error) {
            console.error('Error reading file:', error);
            return { success: false, error };
        }
    };

    const resetFiles = () => {
        setBaseFile(null);
        setSourceFile(null);
        setBaseFileData(null);
        setSourceFileData(null);
    };

    return {
        baseFile,
        sourceFile,
        baseFileData,
        sourceFileData,
        handleFileUpload,
        resetFiles
    };
};