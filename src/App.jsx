// src/App.jsx - Componente principal (copia el código React completo del primer artifact)
import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle, ArrowRight, X, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';

const RunaDataMatcher = () => {
    const [baseFile, setBaseFile] = useState(null);
    const [sourceFile, setSourceFile] = useState(null);
    const [baseFileData, setBaseFileData] = useState(null);
    const [sourceFileData, setSourceFileData] = useState(null);
    const [mapping, setMapping] = useState({});
    const [processedData, setProcessedData] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);

    const baseFileRef = useRef(null);
    const sourceFileRef = useRef(null);

    const handleFileUpload = (file, type) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (type === 'base') {
                setBaseFile(file);
                setBaseFileData(jsonData);
                setCurrentStep(2);
            } else {
                setSourceFile(file);
                setSourceFileData(jsonData);
                setCurrentStep(3);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleMapping = (baseCol, sourceCol) => {
        setMapping(prev => ({
            ...prev,
            [baseCol]: sourceCol
        }));
    };

    const processData = () => {
        if (!baseFileData || !sourceFileData || !mapping) return;

        const baseHeaders = baseFileData[0];
        const sourceHeaders = sourceFileData[0];
        const baseIdCol = 0;
        const sourceIdCol = mapping['ID'] || 0;

        const processed = baseFileData.slice(1).map(baseRow => {
            const baseId = baseRow[baseIdCol];
            const sourceRow = sourceFileData.slice(1).find(row => row[sourceIdCol] === baseId);

            if (sourceRow) {
                const newRow = [...baseRow];
                Object.entries(mapping).forEach(([baseColName, sourceColIndex]) => {
                    const baseColIndex = baseHeaders.indexOf(baseColName);
                    if (baseColIndex !== -1 && sourceColIndex !== undefined) {
                        newRow[baseColIndex] = sourceRow[sourceColIndex] || '';
                    }
                });
                return newRow;
            }
            return baseRow;
        });

        setProcessedData([baseHeaders, ...processed]);
        setCurrentStep(4);
    };

    const downloadProcessedFile = () => {
        if (!processedData) return;

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(processedData);
        XLSX.utils.book_append_sheet(wb, ws, 'Datos Procesados');
        XLSX.writeFile(wb, `runa_datos_procesados_${Date.now()}.xlsx`);
    };

    const resetApp = () => {
        setBaseFile(null);
        setSourceFile(null);
        setBaseFileData(null);
        setSourceFileData(null);
        setMapping({});
        setProcessedData(null);
        setCurrentStep(1);
        setShowPreview(false);
        setPreviewData(null);
    };

    const showDataPreview = (data, title) => {
        setPreviewData({ data: data.slice(0, 6), title });
        setShowPreview(true);
    };

    const StepIndicator = ({ step, isActive, isCompleted }) => (
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${isCompleted ? 'bg-green-500 text-white' :
                isActive ? 'bg-blue-500 text-white' :
                    'bg-gray-300 text-gray-600'
            }`}>
            {isCompleted ? <CheckCircle size={16} /> : step}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                🎯 RUNA Data Matcher
                            </h1>
                            <p className="text-gray-600">
                                Automatiza el matching de datos de nómina entre archivos Excel/CSV
                            </p>
                        </div>
                        <button
                            onClick={resetApp}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <X size={16} />
                            Reiniciar
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                        <div className="flex items-center gap-2">
                            <StepIndicator step={1} isActive={currentStep === 1} isCompleted={currentStep > 1} />
                            <span className="text-sm font-medium">Archivo Base</span>
                        </div>
                        <ArrowRight className="text-gray-400" size={16} />
                        <div className="flex items-center gap-2">
                            <StepIndicator step={2} isActive={currentStep === 2} isCompleted={currentStep > 2} />
                            <span className="text-sm font-medium">Archivo Fuente</span>
                        </div>
                        <ArrowRight className="text-gray-400" size={16} />
                        <div className="flex items-center gap-2">
                            <StepIndicator step={3} isActive={currentStep === 3} isCompleted={currentStep > 3} />
                            <span className="text-sm font-medium">Mapping</span>
                        </div>
                        <ArrowRight className="text-gray-400" size={16} />
                        <div className="flex items-center gap-2">
                            <StepIndicator step={4} isActive={currentStep === 4} isCompleted={currentStep > 4} />
                            <span className="text-sm font-medium">Descarga</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    {currentStep === 1 && (
                        <div className="text-center">
                            <div className="mb-8">
                                <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    Paso 1: Subir Archivo Base (Plantilla RUNA)
                                </h2>
                                <p className="text-gray-600">
                                    Sube el archivo plantilla de RUNA con la estructura de empleados
                                </p>
                            </div>

                            <div
                                className="border-2 border-dashed border-blue-300 rounded-lg p-8 hover:border-blue-400 transition-colors cursor-pointer"
                                onClick={() => baseFileRef.current?.click()}
                            >
                                <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                                <p className="text-lg text-gray-700 mb-2">
                                    Arrastra tu archivo aquí o haz clic para seleccionar
                                </p>
                                <p className="text-sm text-gray-500">
                                    Formatos soportados: .xlsx, .xls, .csv
                                </p>
                            </div>

                            <input
                                ref={baseFileRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'base')}
                                className="hidden"
                            />
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="text-center">
                            <div className="mb-8">
                                <div className="flex items-center justify-center gap-4 mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                    <span className="text-green-600 font-medium">
                                        Archivo base cargado: {baseFile?.name}
                                    </span>
                                    <button
                                        onClick={() => showDataPreview(baseFileData, 'Archivo Base')}
                                        className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
                                    >
                                        <Eye size={14} />
                                        Ver
                                    </button>
                                </div>

                                <FileText className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    Paso 2: Subir Archivo Fuente (Datos a Importar)
                                </h2>
                                <p className="text-gray-600">
                                    Sube el archivo con los datos de percepciones y deducciones
                                </p>
                            </div>

                            <div
                                className="border-2 border-dashed border-orange-300 rounded-lg p-8 hover:border-orange-400 transition-colors cursor-pointer"
                                onClick={() => sourceFileRef.current?.click()}
                            >
                                <Upload className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                                <p className="text-lg text-gray-700 mb-2">
                                    Arrastra tu archivo fuente aquí o haz clic para seleccionar
                                </p>
                                <p className="text-sm text-gray-500">
                                    Este archivo puede tener cualquier estructura de columnas
                                </p>
                            </div>

                            <input
                                ref={sourceFileRef}
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'source')}
                                className="hidden"
                            />
                        </div>
                    )}

                    {currentStep === 3 && baseFileData && sourceFileData && (
                        <div>
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                    Paso 3: Mapeo de Columnas
                                </h2>
                                <p className="text-gray-600">
                                    Selecciona qué columnas del archivo fuente corresponden a cada columna del archivo base
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                        📋 Columnas del Archivo Base
                                    </h3>
                                    <div className="space-y-2">
                                        {baseFileData[0]?.map((col, index) => (
                                            <div key={index} className="p-3 bg-blue-50 rounded-lg">
                                                <span className="font-medium text-blue-800">{col}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                        🔄 Mapeo con Archivo Fuente
                                    </h3>
                                    <div className="space-y-2">
                                        {baseFileData[0]?.map((col, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <span className="w-32 text-sm text-gray-600 truncate">{col}:</span>
                                                <select
                                                    value={mapping[col] || ''}
                                                    onChange={(e) => handleMapping(col, e.target.value ? parseInt(e.target.value) : undefined)}
                                                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">-- Seleccionar columna --</option>
                                                    {sourceFileData[0]?.map((sourceCol, sourceIndex) => (
                                                        <option key={sourceIndex} value={sourceIndex}>
                                                            {sourceCol} (Col {sourceIndex + 1})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => showDataPreview(baseFileData, 'Archivo Base')}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                    >
                                        <Eye size={16} />
                                        Ver Base
                                    </button>
                                    <button
                                        onClick={() => showDataPreview(sourceFileData, 'Archivo Fuente')}
                                        className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
                                    >
                                        <Eye size={16} />
                                        Ver Fuente
                                    </button>
                                </div>

                                <button
                                    onClick={processData}
                                    disabled={Object.keys(mapping).length === 0}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    <ArrowRight size={16} />
                                    Procesar Datos
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && processedData && (
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
                                <div className="grid md:grid-cols-3 gap-4 text-sm">
                                    <div className="bg-white p-3 rounded">
                                        <span className="font-medium">Registros Base:</span>
                                        <span className="ml-2">{baseFileData.length - 1}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded">
                                        <span className="font-medium">Registros Fuente:</span>
                                        <span className="ml-2">{sourceFileData.length - 1}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded">
                                        <span className="font-medium">Columnas Mapeadas:</span>
                                        <span className="ml-2">{Object.keys(mapping).length}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => showDataPreview(processedData, 'Datos Procesados')}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    <Eye size={16} />
                                    Vista Previa
                                </button>
                                <button
                                    onClick={downloadProcessedFile}
                                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                >
                                    <Download size={16} />
                                    Descargar Archivo
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {showPreview && previewData && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl max-h-[80vh] overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h3 className="text-lg font-semibold">{previewData.title}</h3>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4 overflow-auto">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                {previewData.data[0]?.map((header, index) => (
                                                    <th key={index} className="border border-gray-300 p-2 text-left text-xs font-medium">
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.data.slice(1).map((row, rowIndex) => (
                                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={cellIndex} className="border border-gray-300 p-2 text-xs">
                                                            {cell || '-'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    * Mostrando primeras 5 filas. Total de registros: {previewData.data.length - 1}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RunaDataMatcher;