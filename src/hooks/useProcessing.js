import { useState } from 'react';
import { downloadExcelFile } from '../utils/excelUtils.js';
import { ZERO_VALUE_KEY, MATCHING_FIELD_TYPES } from '../utils/constants.js';

export const useProcessing = () => {
    const [processedData, setProcessedData] = useState(null);

    const processData = (baseFileData, sourceFileData, mapping, matchingColumnIndex, matchingFieldType) => {
        if (!baseFileData || !sourceFileData || !mapping || matchingColumnIndex === null) return;

        console.log('Iniciando procesamiento...');
        console.log('Mapping actual:', mapping);
        console.log('Columna de matching configurada:', matchingColumnIndex);
        console.log('Tipo de campo de matching:', matchingFieldType);

        const baseHeaders = baseFileData[0];
        const sourceHeaders = sourceFileData[0];
        const baseIdCol = matchingFieldType === MATCHING_FIELD_TYPES.ID ? 0 : 1; // ID = columna 0, RFC = columna 1

        // Usar la columna de matching configurada en el paso 3
        const sourceIdCol = matchingColumnIndex;

        console.log('Campo de matching:', baseHeaders[baseIdCol]);
        console.log('ID columns - Base:', baseIdCol, 'Source:', sourceIdCol);

        const processed = baseFileData.slice(1).map(baseRow => {
            const baseId = baseRow[baseIdCol];

            // Solo procesar empleados válidos (con ID no vacío)
            if (!baseId || baseId.toString().trim() === '') {
                return baseRow; // Mantener filas vacías como están
            }

            // Buscar coincidencia usando la columna de matching configurada
            const sourceRow = sourceFileData.slice(1).find(row => {
                const sourceId = row[sourceIdCol];
                return sourceId !== undefined && sourceId !== null && sourceId !== '' &&
                    sourceId.toString().trim() === baseId.toString().trim();
            });

            const newRow = [...baseRow];

            // Procesar mapeos para columnas que no sean las 5 primeras (ID, RFC, Nombre, Apellidos)
            Object.entries(mapping).forEach(([baseColName, sourceColIndex]) => {
                const baseColIndex = baseHeaders.indexOf(baseColName);

                // Solo mapear si es una columna mapeable (índice >= 5)
                if (baseColIndex !== -1 && sourceColIndex !== undefined && baseColIndex >= 5) {
                    if (sourceColIndex === ZERO_VALUE_KEY) {
                        // Llenar con valor 0 si se seleccionó "Sin valor existente"
                        newRow[baseColIndex] = 0;
                        console.log(`Columna ${baseColName} llenada con valor 0`);
                    } else if (sourceRow) {
                        // Mapear desde archivo fuente si hay coincidencia
                        newRow[baseColIndex] = sourceRow[sourceColIndex] || '';
                    }
                    // Si no hay sourceRow y no es ZERO_VALUE, mantener valor original
                }
            });

            return newRow;
        });

        console.log('Procesamiento completado. Filas procesadas:', processed.length);
        const finalData = [baseHeaders, ...processed];
        setProcessedData(finalData);
        return finalData;
    };

    const downloadProcessedFile = () => {
        if (!processedData) return;

        const filename = `runa_datos_procesados_${Date.now()}.xlsx`;
        downloadExcelFile(processedData, filename);
    };

    const resetProcessedData = () => {
        setProcessedData(null);
    };

    return {
        processedData,
        processData,
        downloadProcessedFile,
        resetProcessedData
    };
};
