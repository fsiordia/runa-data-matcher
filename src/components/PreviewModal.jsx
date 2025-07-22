import React from 'react';
import { X, Eye } from 'lucide-react';
import { getExcelColumnName } from '../utils/excelUtils.js';

const PreviewModal = ({ showPreview, previewData, onClose, onOpenIndependent }) => {
    if (!showPreview || !previewData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <div>
                        <h3 className="text-lg font-semibold">{previewData.title}</h3>
                        <p className="text-sm text-gray-600">
                            Mostrando {Math.min(20, previewData.data.length - 1)} de {previewData.data.length - 1} registros
                            {previewData.data.length > 21 && ' (+ ' + (previewData.data.length - 21) + ' más)'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onOpenIndependent(previewData.data, previewData.title)}
                            className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 text-sm"
                            title="Abrir en ventana independiente"
                        >
                            📋 Independiente
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="p-4 overflow-auto max-h-[75vh]">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-sm">
                            <thead className="sticky top-0 bg-gray-100">
                                <tr>
                                    <th className="border border-gray-300 p-2 text-center text-xs font-bold bg-gray-200 min-w-[40px]">
                                        #
                                    </th>
                                    {previewData.data[0]?.map((header, index) => (
                                        <th key={index} className="border border-gray-300 p-1 text-left text-xs font-bold bg-blue-50 min-w-[120px]">
                                            <div className="space-y-1">
                                                <div className="text-center bg-green-100 rounded px-1 py-0.5 text-green-800 font-mono text-xs">
                                                    {getExcelColumnName(index)}
                                                </div>
                                                <div className="truncate font-normal text-gray-700" title={header || `Columna ${index + 1}`}>
                                                    {header || `Columna ${index + 1}`}
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.data.slice(1).map((row, rowIndex) => (
                                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="border border-gray-300 p-2 text-xs font-medium text-gray-500 bg-gray-100 text-center">
                                            {rowIndex + 1}
                                        </td>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="border border-gray-300 p-2 text-xs max-w-[200px]">
                                                <div className="truncate" title={cell || '-'}>
                                                    {cell || '-'}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {previewData.data.length > 21 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                                <strong>📊 Información del archivo:</strong>
                            </p>
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <div>
                                    <span className="font-medium">Total registros:</span>
                                    <span className="ml-1">{previewData.data.length - 1}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Total columnas:</span>
                                    <span className="ml-1">{previewData.data[0]?.length || 0}</span>
                                </div>
                                <div>
                                    <span className="font-medium">Mostrando:</span>
                                    <span className="ml-1">Primeros 20 registros</span>
                                </div>
                                <div>
                                    <span className="font-medium">Restantes:</span>
                                    <span className="ml-1">{previewData.data.length - 21} registros</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;