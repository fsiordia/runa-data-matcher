import React from 'react';
import { CheckCircle, Download, Eye, ArrowRight } from 'lucide-react';
import { getExcelColumnName } from '../../utils/excelUtils.js';
import { ZERO_VALUE_KEY } from '../../utils/constants.js';

const Step5Download = ({
    processedData,
    baseFileData,
    sourceFileData,
    mapping,
    matchingAnalysis,
    onBack,
    onDownload,
    onShowPreview,
    onOpenIndependent
}) => {
    return (
        <div className="text-center">
            <div className="mb-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    ✅ Procesamiento Completado
                </h2>
                <p className="text-gray-600">
                    Los datos han sido procesados exitosamente. Puedes descargar el archivo final.
                </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                    📊 Resumen del Procesamiento
                </h3>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-white p-3 rounded">
                        <span className="font-medium">Empleados Válidos:</span>
                        <span className="ml-2">{(() => {
                            // Contar solo filas con ID válido (no vacío) en el archivo base
                            const validEmployees = baseFileData.slice(1).filter(row =>
                                row[0] !== undefined &&
                                row[0] !== null &&
                                row[0] !== '' &&
                                row[0].toString().trim() !== ''
                            ).length;
                            return validEmployees;
                        })()}</span>
                    </div>
                    <div className="bg-white p-3 rounded">
                        <span className="font-medium">Registros Fuente:</span>
                        <span className="ml-2">{sourceFileData.length - 1}</span>
                    </div>
                    <div className="bg-white p-3 rounded">
                        <span className="font-medium">Columnas Mapeadas:</span>
                        <span className="ml-2">{Object.keys(mapping).length}</span>
                    </div>
                    <div className="bg-white p-3 rounded">
                        <span className="font-medium">% Matching:</span>
                        <span className="ml-2">{matchingAnalysis?.matchPercentage.toFixed(1)}%</span>
                    </div>
                </div>

                {/* Detalle de mapeos realizados */}
                <div className="mt-4 p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold text-gray-700 mb-3">🔄 Mapeos Configurados:</h4>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                        {Object.entries(mapping).map(([baseCol, sourceCol]) => (
                            <div key={baseCol} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="font-medium text-gray-700">{baseCol}</span>
                                <span className="text-gray-500">→</span>
                                {sourceCol === ZERO_VALUE_KEY ? (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                                        🔢 Valor: 0
                                    </span>
                                ) : (
                                    <span className="text-blue-600 font-medium">
                                        {sourceFileData[0]?.[sourceCol]} (Col {getExcelColumnName(sourceCol)})
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                    {Object.keys(mapping).length === 0 && (
                        <p className="text-gray-500 text-center py-2">No se configuraron mapeos adicionales</p>
                    )}
                </div>
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    title="Volver al paso de mapeo para ajustar configuración"
                >
                    <ArrowRight size={16} className="rotate-180" />
                    ⚙️ Ajustar Mapping
                </button>

                <button
                    onClick={() => onShowPreview(processedData, 'Datos Procesados')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    <Eye size={16} />
                    Vista Previa
                </button>

                <button
                    onClick={() => onOpenIndependent(processedData, 'Datos Procesados')}
                    className="flex items-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    title="Abrir en ventana independiente"
                >
                    📋 Vista Independiente
                </button>

                <button
                    onClick={onDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                >
                    <Download size={16} />
                    ⬇️ Descargar Archivo Final
                </button>
            </div>

            {/* Información adicional sobre los ajustes */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                    <div className="text-blue-500 text-xl">💡</div>
                    <div className="text-left">
                        <h4 className="font-semibold text-blue-800 mb-1">¿Necesitas hacer ajustes?</h4>
                        <p className="text-sm text-blue-700">
                            Si seleccionaste una columna incorrecta durante el mapeo, puedes usar el botón
                            <strong> "⚙️ Ajustar Mapping"</strong> para volver al paso anterior.
                            Todos tus mapeos se mantendrán guardados y solo necesitarás ajustar lo que requieras.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step5Download;
