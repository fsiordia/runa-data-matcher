import React from 'react';
import { CheckCircle } from 'lucide-react';
import { getExcelColumnName } from '../../utils/excelUtils.js';
import { MATCHING_FIELD_TYPES } from '../../utils/constants.js';

const Step3Matching = ({
    baseFileData,
    sourceFileData,
    matchingFieldType,
    matchingColumnIndex,
    matchingAnalysis,
    onFieldTypeChange,
    onColumnChange,
    onBack,
    onContinue
}) => {
    return (
        <div className="text-center">
            <div className="mb-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <span className="text-green-600 font-medium">
                        Archivos cargados correctamente
                    </span>
                </div>

                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔑</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Paso 3: Configurar Campo de Matching
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Selecciona qué campo del archivo base usar para el matching y luego identifica
                    la columna correspondiente en el archivo fuente.
                </p>
            </div>

            <div className="max-w-5xl mx-auto">
                {/* Selector de Campo Base */}
                <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                        🎯 Paso 1: Seleccionar Campo Base para Matching
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${matchingFieldType === MATCHING_FIELD_TYPES.ID
                                    ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200'
                                    : 'border-gray-300 bg-white hover:border-yellow-300'
                                }`}
                            onClick={() => onFieldTypeChange(MATCHING_FIELD_TYPES.ID)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold ${matchingFieldType === MATCHING_FIELD_TYPES.ID ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    A
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-800">{baseFileData[0]?.[0]}</div>
                                    <div className="text-sm text-gray-600">Columna A - ID de Empleado</div>
                                </div>
                                {matchingFieldType === MATCHING_FIELD_TYPES.ID && (
                                    <span className="ml-auto px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                        ✅ Seleccionado
                                    </span>
                                )}
                            </div>
                        </div>

                        <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${matchingFieldType === MATCHING_FIELD_TYPES.RFC
                                    ? 'border-purple-400 bg-purple-50 ring-2 ring-purple-200'
                                    : 'border-gray-300 bg-white hover:border-purple-300'
                                }`}
                            onClick={() => onFieldTypeChange(MATCHING_FIELD_TYPES.RFC)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold ${matchingFieldType === MATCHING_FIELD_TYPES.RFC ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    B
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-800">{baseFileData[0]?.[1]}</div>
                                    <div className="text-sm text-gray-600">Columna B - RFC</div>
                                </div>
                                {matchingFieldType === MATCHING_FIELD_TYPES.RFC && (
                                    <span className="ml-auto px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                        ✅ Seleccionado
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>💡 Sugerencia:</strong> Usa <strong>ID de Empleado</strong> cuando los IDs estén completos y correctos.
                            Usa <strong>RFC</strong> cuando los IDs del archivo fuente tengan problemas o estén incompletos.
                        </p>
                    </div>
                </div>

                {/* Selector de Columna Fuente */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Campo Base Seleccionado */}
                    <div className={`border-2 rounded-xl p-6 ${matchingFieldType === MATCHING_FIELD_TYPES.ID ? 'bg-yellow-50 border-yellow-200' : 'bg-purple-50 border-purple-200'
                        }`}>
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${matchingFieldType === MATCHING_FIELD_TYPES.ID ? 'text-yellow-800' : 'text-purple-800'
                            }`}>
                            📋 Campo Seleccionado en Archivo Base
                        </h3>
                        <div className="bg-white rounded-lg p-4 border border-gray-300">
                            <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded text-sm flex items-center justify-center font-mono font-bold ${matchingFieldType === MATCHING_FIELD_TYPES.ID
                                        ? 'bg-yellow-200 text-yellow-800'
                                        : 'bg-purple-200 text-purple-800'
                                    }`}>
                                    {matchingFieldType === MATCHING_FIELD_TYPES.ID ? 'A' : 'B'}
                                </span>
                                <div>
                                    <div className="font-semibold text-gray-800">
                                        {baseFileData[0]?.[matchingFieldType === MATCHING_FIELD_TYPES.ID ? 0 : 1]}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {matchingFieldType === MATCHING_FIELD_TYPES.ID ? 'ID de Empleado' : 'RFC'} - Campo para matching
                                    </div>
                                </div>
                                <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${matchingFieldType === MATCHING_FIELD_TYPES.ID
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-purple-100 text-purple-700'
                                    }`}>
                                    🔑 Campo Clave
                                </span>
                            </div>
                        </div>
                        <div className={`mt-4 p-3 rounded-lg ${matchingFieldType === MATCHING_FIELD_TYPES.ID ? 'bg-yellow-100' : 'bg-purple-100'
                            }`}>
                            <p className={`text-sm ${matchingFieldType === MATCHING_FIELD_TYPES.ID ? 'text-yellow-800' : 'text-purple-800'
                                }`}>
                                <strong>Total de empleados:</strong> {baseFileData ? (() => {
                                    const fieldIndex = matchingFieldType === MATCHING_FIELD_TYPES.ID ? 0 : 1;
                                    return baseFileData.slice(1).filter(row =>
                                        row[fieldIndex] !== undefined &&
                                        row[fieldIndex] !== null &&
                                        row[fieldIndex] !== '' &&
                                        row[fieldIndex].toString().trim() !== ''
                                    ).length;
                                })() : 0}
                            </p>
                        </div>
                    </div>

                    {/* Archivo Fuente - Selección */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                            🎯 Paso 2: Seleccionar Columna Correspondiente
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-800 mb-2">
                                    ¿En qué columna del archivo fuente está el <strong>{matchingFieldType === MATCHING_FIELD_TYPES.ID ? 'ID de empleado' : 'RFC'}</strong>?
                                </label>
                                <select
                                    value={matchingColumnIndex !== null ? matchingColumnIndex.toString() : ''}
                                    onChange={(e) => onColumnChange(e.target.value !== '' ? parseInt(e.target.value) : null)}
                                    className="w-full p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="">-- Seleccionar columna del archivo fuente --</option>
                                    {sourceFileData[0]?.map((sourceCol, sourceIndex) => (
                                        <option key={sourceIndex} value={sourceIndex.toString()}>
                                            Columna {getExcelColumnName(sourceIndex)} - {sourceCol}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {matchingColumnIndex !== null && (
                                <div className="bg-white rounded-lg p-4 border border-blue-300">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 bg-blue-200 text-blue-800 rounded text-sm flex items-center justify-center font-mono font-bold">
                                            {getExcelColumnName(matchingColumnIndex)}
                                        </span>
                                        <div>
                                            <div className="font-semibold text-gray-800">{sourceFileData[0]?.[matchingColumnIndex]}</div>
                                            <div className="text-sm text-gray-600">Campo seleccionado para matching</div>
                                        </div>
                                        <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                            ✅ Seleccionado
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Análisis de Matching */}
                {matchingAnalysis && (
                    <div className="mb-8">
                        <div className={`rounded-xl p-6 border-2 ${matchingAnalysis.matchedCount === matchingAnalysis.totalCount
                                ? 'bg-green-50 border-green-200'
                                : 'bg-orange-50 border-orange-200'
                            }`}>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                {matchingAnalysis.matchedCount === matchingAnalysis.totalCount ? (
                                    <span className="text-green-600">✅ Análisis de Matching Completado</span>
                                ) : (
                                    <span className="text-orange-600">⚠️ Análisis de Matching - Atención Requerida</span>
                                )}
                            </h3>

                            {/* Información del campo de matching */}
                            <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="font-medium text-gray-700">Matching configurado:</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${matchingFieldType === MATCHING_FIELD_TYPES.ID
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-purple-100 text-purple-800'
                                        }`}>
                                        Campo Base: {matchingAnalysis.baseFieldName} (Col {matchingFieldType === MATCHING_FIELD_TYPES.ID ? 'A' : 'B'})
                                    </span>
                                    <span className="text-gray-500">↔</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                        Campo Fuente: {matchingAnalysis.sourceColumnName} (Col {getExcelColumnName(matchingAnalysis.sourceColumnIndex)})
                                    </span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-white rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{matchingAnalysis.totalCount}</div>
                                    <div className="text-sm text-gray-600">Total Empleados</div>
                                    <div className="text-xs text-gray-500">Con {matchingFieldType} válido</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{matchingAnalysis.matchedCount}</div>
                                    <div className="text-sm text-gray-600">Con Match</div>
                                    <div className="text-xs text-gray-500">Encontrados en archivo fuente</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 text-center">
                                    <div className="text-2xl font-bold text-orange-600">{matchingAnalysis.unmatchedCount}</div>
                                    <div className="text-sm text-gray-600">Sin Match</div>
                                    <div className="text-xs text-gray-500">No encontrados</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold">Porcentaje de Coincidencia:</span>
                                    <span className={`text-lg font-bold ${matchingAnalysis.matchPercentage === 100 ? 'text-green-600' : 'text-orange-600'
                                        }`}>
                                        {matchingAnalysis.matchPercentage.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full ${matchingAnalysis.matchPercentage === 100 ? 'bg-green-500' : 'bg-orange-500'
                                            }`}
                                        style={{ width: `${matchingAnalysis.matchPercentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            {matchingAnalysis.unmatched.length > 0 && (
                                <div className="mt-6 bg-white rounded-lg p-4">
                                    <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                                        ⚠️ Empleados Sin Match ({matchingAnalysis.unmatched.length})
                                    </h4>
                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                        {matchingAnalysis.unmatched.map((item, index) => (
                                            <div key={index} className="flex items-center gap-3 text-sm bg-orange-50 p-2 rounded">
                                                <span className="font-mono text-orange-700 bg-orange-200 px-2 py-1 rounded text-xs">
                                                    Fila {item.rowIndex + 1}
                                                </span>
                                                <span className="font-medium text-orange-800">
                                                    {matchingFieldType}: {item.matchValue}
                                                </span>
                                                <span className="text-orange-600">ID: {item.id}</span>
                                                {item.name && <span className="text-orange-600">- {item.name}</span>}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-orange-700 mt-2">
                                        💡 Estos empleados no tienen {matchingFieldType === MATCHING_FIELD_TYPES.ID ? 'IDs' : 'RFCs'} correspondientes en el archivo fuente y mantendrán solo sus datos del archivo base.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                        ← Volver
                    </button>
                    <button
                        onClick={onContinue}
                        disabled={matchingColumnIndex === null}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        title={matchingColumnIndex === null ? "Selecciona la columna de matching primero" : "Continuar al mapeo de columnas"}
                    >
                        Continuar al Mapeo →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step3Matching;