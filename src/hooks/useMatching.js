import { useState } from 'react';
import { MATCHING_FIELD_TYPES } from '../utils/constants.js';

export const useMatching = () => {
  const [matchingColumnIndex, setMatchingColumnIndex] = useState(null);
  const [matchingAnalysis, setMatchingAnalysis] = useState(null);
  const [matchingFieldType, setMatchingFieldType] = useState(MATCHING_FIELD_TYPES.ID);

  const analyzeMatching = (baseFileData, sourceFileData, sourceColumnIndex, fieldType = matchingFieldType) => {
    if (!baseFileData || !sourceFileData || sourceColumnIndex === null) return;

    console.log('Analizando matching con columna fuente:', sourceColumnIndex, 'Campo base:', fieldType);

    const baseRows = baseFileData.slice(1); // Excluir headers
    const sourceRows = sourceFileData.slice(1); // Excluir headers
    const baseFieldIndex = fieldType === MATCHING_FIELD_TYPES.ID ? 0 : 1; // ID = columna 0, RFC = columna 1
    
    // Crear un Set con todos los valores válidos del archivo fuente para búsqueda rápida
    const sourceValues = new Set();
    sourceRows.forEach(row => {
      if (row[sourceColumnIndex] !== undefined && 
          row[sourceColumnIndex] !== null && 
          row[sourceColumnIndex] !== '' &&
          row[sourceColumnIndex].toString().trim() !== '') {
        sourceValues.add(row[sourceColumnIndex].toString().trim());
      }
    });

    console.log(`${fieldType}s únicos válidos en archivo fuente:`, sourceValues.size);

    const matched = [];
    const unmatched = [];
    let validEmployees = 0;

    baseRows.forEach((row, index) => {
      const baseValue = row[baseFieldIndex]; // Usar la columna correspondiente al tipo de campo
      const baseName = row[2] || ''; // Tercera columna (nombre) si existe
      
      // Solo contar como empleado válido si tiene un valor no vacío en el campo base correspondiente
      if (baseValue !== undefined && 
          baseValue !== null && 
          baseValue !== '' && 
          baseValue.toString().trim() !== '') {
        
        validEmployees++;
        const baseValueStr = baseValue.toString().trim();
        
        if (sourceValues.has(baseValueStr)) {
          matched.push({
            rowIndex: index + 1, // +1 porque excluimos headers
            id: row[0], // Siempre mostrar ID para referencia
            rfc: row[1], // Siempre mostrar RFC para referencia
            matchValue: baseValue, // El valor que hizo match
            name: baseName
          });
        } else {
          unmatched.push({
            rowIndex: index + 1,
            id: row[0],
            rfc: row[1],
            matchValue: baseValue,
            name: baseName
          });
        }
      }
    });

    const analysis = {
      totalCount: validEmployees,
      matchedCount: matched.length,
      unmatchedCount: unmatched.length,
      matchPercentage: validEmployees > 0 ? (matched.length / validEmployees) * 100 : 0,
      matched: matched,
      unmatched: unmatched,
      sourceColumnIndex: sourceColumnIndex,
      sourceColumnName: sourceFileData[0][sourceColumnIndex],
      matchingFieldType: fieldType,
      baseFieldIndex: baseFieldIndex,
      baseFieldName: baseFileData[0][baseFieldIndex]
    };

    console.log('Análisis de matching:', analysis);
    console.log('Filas totales en base:', baseRows.length, 'Empleados válidos:', validEmployees);
    setMatchingAnalysis(analysis);
    return analysis;
  };

  const updateMatchingColumn = (baseFileData, sourceFileData, columnIndex) => {
    setMatchingColumnIndex(columnIndex);
    if (columnIndex !== null) {
      analyzeMatching(baseFileData, sourceFileData, columnIndex, matchingFieldType);
    } else {
      setMatchingAnalysis(null);
    }
  };

  const updateMatchingFieldType = (baseFileData, sourceFileData, fieldType) => {
    setMatchingFieldType(fieldType);
    setMatchingAnalysis(null);
    if (matchingColumnIndex !== null) {
      analyzeMatching(baseFileData, sourceFileData, matchingColumnIndex, fieldType);
    }
  };

  const resetMatching = () => {
    setMatchingColumnIndex(null);
    setMatchingAnalysis(null);
    setMatchingFieldType(MATCHING_FIELD_TYPES.ID);
  };

  return {
    matchingColumnIndex,
    matchingAnalysis,
    matchingFieldType,
    analyzeMatching,
    updateMatchingColumn,
    updateMatchingFieldType,
    resetMatching
  };
};
