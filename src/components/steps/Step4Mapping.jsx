import React from 'react';
import { CheckCircle, Eye, ArrowRight } from 'lucide-react';
import { getExcelColumnName } from '../../utils/excelUtils.js';
import { ZERO_VALUE_KEY } from '../../utils/constants.js';

const Step4Mapping = ({
    baseFileData,
    sourceFileData,
    matchingColumnIndex,
    matchingAnalysis,
    mapping,
    onMapping,
    onBack,
    onProcess,
    onShowPreview,
    onOpenIndependent
}) => {
    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Paso 4: Mapeo de Columnas Adicionales
                </h2>
                <p className="text-gray-600">
                    Configura el mapeo para las columnas adicionales (percepciones, deducciones, etc.)
                </p>
                {matchingAnalysis && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm">
                        <span>🔑</span>
                        <span>Matching configurado: {matchingAnalysis.matchPercentage.toFixed(1)}% coincidencia</span>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                        📋 Estructura del Archivo Base
                    </h3>
                    <div className="space-y-2">
                        {baseFileData[0]?.map((col, index) => {
                            const isIdColumn = index === 0;
                            const isFixedColumn = index >= 1 && index <= 4;
                            const isMappableColumn = index >= 5;

                            return (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg border-l-4 ${isIdColumn
                                        ? 'bg-yellow-50 border-yellow-400'
                                        : isFixedColumn
                                            ? 'bg-gray-50 border-gray-300'
                                            : 'bg-blue-50 border-blue-400'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded font-mono ${isIdColumn
                                            ? 'bg-yellow-200 text-yellow-800'
                                            : isFixedColumn
                                                ? 'bg-gray-200 text-gray-600'
                                                : 'bg-blue-200 text-blue-800'
                                            }`}>
                                            {getExcelColumnName(index)}
                                        </span>
                                        <span className={`font-medium ${isIdColumn
                                            ? 'text-yellow-800'
                                            : isFixedColumn
                                                ? 'text-gray-600'
                                                : 'text-blue-800'
                                            }`}>
                                            {col}
                                        </span>
                                        {isIdColumn && (
                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                                🔑 Campo de Matching
                                            </span>
                                        )}
                                        {isFixedColumn && (
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                📌 Campo Fijo
                                            </span>
                                        )}
                                        {isMappableColumn && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                🔄 Mapeable
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                        🔄 Configuración de Mapeo
                    </h3>

                    {/* Sección especial para ID de empleado */}
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                            ✅ Campo de Matching Configurado
                        </h4>
                        <div className="flex items-center gap-3 bg-white p-3 rounded border">
                            <span className="w-8 h-8 bg-yellow-200 text-yellow-800 rounded text-sm flex items-center justify-center font-mono font-bold">
                                A
                            </span>
                            <span className="font-medium text-gray-800">{baseFileData[0]?.[0]}</span>
                            <span className="text-gray-500">↔</span>
                            <span className="w-8 h-8 bg-blue-200 text-blue-800 rounded text-sm flex items-center justify-center font-mono font-bold">
                                {getExcelColumnName(matchingColumnIndex)}
                            </span>
                            <span className="font-medium text-gray-800">{sourceFileData[0]?.[matchingColumnIndex]}</span>
                            <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                🔑 Matching OK
                            </span>
                        </div>
                    </div>

                    {/* Información sobre campos fijos */}
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            📌 Campos Fijos (No requieren mapeo)
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                            {baseFileData[0]?.slice(1, 5).map((col, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-gray-200 text-gray-600 rounded text-xs flex items-center justify-center font-mono">
                                        {getExcelColumnName(index + 1)}
                                    </span>
                                    <span>{col}</span>
                                    <span className="text-xs text-gray-500">- Ya incluido en archivo base</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mapeo para columnas restantes */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                            🔄 Mapeo de Columnas Adicionales
                        </h4>
                        {baseFileData[0]?.slice(5).map((col, index) => {
                            const realIndex = index + 5;
                            return (
                                <div key={realIndex} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                    <span className="w-8 h-8 bg-blue-200 text-blue-800 rounded text-xs flex items-center justify-center font-mono font-bold">
                                        {getExcelColumnName(realIndex)}
                                    </span>
                                    <span className="w-32 text-sm text-blue-800 font-medium truncate" title={col}>
                                        {col}:
                                    </span>
                                    <select
                                        value={mapping[col] !== undefined ? (mapping[col] === ZERO_VALUE_KEY ? ZERO_VALUE_KEY : mapping[col].toString()) : ''}
                                        onChange={(e) => onMapping(col, e.target.value)}
                                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Seleccionar columna --</option>
                                        <option value={ZERO_VALUE_KEY} className="bg-yellow-50 text-yellow-800 font-medium">
                                            🔢 Sin valor existente (0)
                                        </option>
                                        {sourceFileData[0]?.map((sourceCol, sourceIndex) => (
                                            <option key={sourceIndex} value={sourceIndex.toString()}>
                                                {sourceCol} (Columna {getExcelColumnName(sourceIndex)})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                        ← Campo Matching
                    </button>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onShowPreview(baseFileData, 'Archivo Base')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        >
                            <Eye size={16} />
                            Ver Base
                        </button>
                        <button
                            onClick={() => onOpenIndependent(baseFileData, 'Archivo Base')}
                            className="flex items-center gap-1 px-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                            title="Abrir Archivo Base en ventana independiente"
                        >
                            📋
                        </button>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onShowPreview(sourceFileData, 'Archivo Fuente')}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
                        >
                            <Eye size={16} />
                            Ver Fuente
                        </button>
                        <button
                            onClick={() => onOpenIndependent(sourceFileData, 'Archivo Fuente')}
                            className="flex items-center gap-1 px-2 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100"
                            title="Abrir Archivo Fuente en ventana independiente"
                        >
                            📋
                        </button>
                    </div>
                </div>

                <button
                    onClick={onProcess}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    title="Procesar datos con la configuración actual"
                >
                    <ArrowRight size={16} />
                    Procesar Datos
                    <div className="flex gap-1 ml-2">
                        <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs">
                            🔑 Matching OK
                        </span>
                        {Object.keys(mapping).filter(key => mapping[key] !== undefined).length > 0 && (
                            <span className="px-2 py-1 bg-green-400 text-green-900 rounded-full text-xs">
                                +{Object.keys(mapping).filter(key => mapping[key] !== undefined).length} mapeos
                                {Object.values(mapping).filter(val => val === ZERO_VALUE_KEY).length > 0 && (
                                    <span className="ml-1">({Object.values(mapping).filter(val => val === ZERO_VALUE_KEY).length} con 0)</span>
                                )}
                            </span>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Step4Mapping;
