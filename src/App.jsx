import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle, ArrowRight, X, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';

const RunaDataMatcher = () => {
    // Versión de la aplicación - actualizar con cada cambio
    const APP_VERSION = "v55";

    const [baseFile, setBaseFile] = useState(null);
    const [sourceFile, setSourceFile] = useState(null);
    const [baseFileData, setBaseFileData] = useState(null);
    const [sourceFileData, setSourceFileData] = useState(null);
    const [mapping, setMapping] = useState({});
    const [processedData, setProcessedData] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [independentPreviews, setIndependentPreviews] = useState([]);
    const [matchingColumnIndex, setMatchingColumnIndex] = useState(null);
    const [matchingAnalysis, setMatchingAnalysis] = useState(null);

    const baseFileRef = useRef(null);
    const sourceFileRef = useRef(null);

    const handleFileUpload = (file, type) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Para el archivo base, eliminar la segunda fila (índice 1)
            if (type === 'base' && jsonData.length > 2) {
                console.log('Archivo base original tiene', jsonData.length, 'filas');
                console.log('Eliminando segunda fila:', jsonData[1]);
                jsonData = [jsonData[0], ...jsonData.slice(2)]; // Mantener header y desde la tercera fila
                console.log('Archivo base después de eliminar segunda fila tiene', jsonData.length, 'filas');
            }

            if (type === 'base') {
                setBaseFile(file);
                setBaseFileData(jsonData);
                setCurrentStep(2);
            } else {
                setSourceFile(file);
                setSourceFileData(jsonData);
                setCurrentStep(3); // Ir al nuevo paso de campo matching
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleMapping = (baseCol, sourceCol) => {
        console.log('Mapping:', baseCol, 'to source column index:', sourceCol);

        if (sourceCol === 'ZERO_VALUE') {
            // Opción especial para llenar con ceros
            setMapping(prev => ({
                ...prev,
                [baseCol]: 'ZERO_VALUE'
            }));
        } else {
            setMapping(prev => ({
                ...prev,
                [baseCol]: sourceCol !== '' ? parseInt(sourceCol) : undefined
            }));
        }
    };

    const analyzeMatching = (sourceColumnIndex) => {
        if (!baseFileData || !sourceFileData || sourceColumnIndex === null) return;

        console.log('Analizando matching con columna fuente:', sourceColumnIndex);

        const baseRows = baseFileData.slice(1); // Excluir headers
        const sourceRows = sourceFileData.slice(1); // Excluir headers

        // Crear un Set con todos los IDs válidos del archivo fuente para búsqueda rápida
        const sourceIds = new Set();
        sourceRows.forEach(row => {
            if (row[sourceColumnIndex] !== undefined &&
                row[sourceColumnIndex] !== null &&
                row[sourceColumnIndex] !== '' &&
                row[sourceColumnIndex].toString().trim() !== '') {
                sourceIds.add(row[sourceColumnIndex].toString().trim());
            }
        });

        console.log('IDs únicos válidos en archivo fuente:', sourceIds.size);

        const matched = [];
        const unmatched = [];
        let validEmployees = 0;

        baseRows.forEach((row, index) => {
            const baseId = row[0]; // Primera columna del archivo base
            const baseName = row[2] || ''; // Tercera columna (nombre) si existe

            // Solo contar como empleado válido si tiene un ID no vacío en la primera columna
            if (baseId !== undefined &&
                baseId !== null &&
                baseId !== '' &&
                baseId.toString().trim() !== '') {

                validEmployees++;
                const baseIdStr = baseId.toString().trim();

                if (sourceIds.has(baseIdStr)) {
                    matched.push({
                        rowIndex: index + 1, // +1 porque excluimos headers
                        id: baseId,
                        name: baseName
                    });
                } else {
                    unmatched.push({
                        rowIndex: index + 1,
                        id: baseId,
                        name: baseName
                    });
                }
            }
        });

        const analysis = {
            totalCount: validEmployees, // Usar empleados válidos en lugar de todas las filas
            matchedCount: matched.length,
            unmatchedCount: unmatched.length,
            matchPercentage: validEmployees > 0 ? (matched.length / validEmployees) * 100 : 0,
            matched: matched,
            unmatched: unmatched,
            sourceColumnIndex: sourceColumnIndex,
            sourceColumnName: sourceFileData[0][sourceColumnIndex]
        };

        console.log('Análisis de matching:', analysis);
        console.log('Filas totales en base:', baseRows.length, 'Empleados válidos:', validEmployees);
        setMatchingAnalysis(analysis);
    };

    const processData = () => {
        if (!baseFileData || !sourceFileData || !mapping || matchingColumnIndex === null) return;

        console.log('Iniciando procesamiento...');
        console.log('Mapping actual:', mapping);
        console.log('Columna de matching configurada:', matchingColumnIndex);

        const baseHeaders = baseFileData[0];
        const sourceHeaders = sourceFileData[0];
        const baseIdCol = 0; // Primera columna del archivo base (ID de empleado)

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
                    if (sourceColIndex === 'ZERO_VALUE') {
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
        setProcessedData([baseHeaders, ...processed]);
        setCurrentStep(5); // Ir al paso 5 (antes era 4)
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
        setMatchingColumnIndex(null);
        setMatchingAnalysis(null);
        closeAllPreviews();
    };

    const showDataPreview = (data, title) => {
        setPreviewData({ data: data.slice(0, 21), title }); // Mostrar 20 filas + header
        setShowPreview(true);
    };

    const openIndependentPreview = (data, title) => {
        console.log('Abriendo preview independiente:', title, 'Data length:', data?.length);
        if (!data || data.length === 0) {
            console.error('No hay datos para mostrar');
            return;
        }

        // Crear HTML completo para la nueva ventana
        const htmlContent = generatePreviewHTML(data, title);

        // Abrir nueva ventana del navegador
        const newWindow = window.open('', '_blank',
            'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no'
        );

        if (newWindow) {
            newWindow.document.write(htmlContent);
            newWindow.document.close();
            newWindow.focus();

            // Actualizar contador para UI
            const newPreview = {
                id: Date.now(),
                title: title,
                timestamp: new Date().toLocaleTimeString(),
                window: newWindow
            };

            setIndependentPreviews(prev => {
                const updated = [...prev, newPreview];
                console.log('Ventana abierta, total:', updated.length);
                return updated;
            });

            // Detectar cuando se cierra la ventana
            const checkClosed = setInterval(() => {
                if (newWindow.closed) {
                    setIndependentPreviews(prev => prev.filter(p => p.id !== newPreview.id));
                    clearInterval(checkClosed);
                    console.log('Ventana cerrada');
                }
            }, 1000);
        } else {
            alert('No se pudo abrir la ventana. Verifica que no esté bloqueado por el navegador.');
        }
    };

    // Función para generar HTML completo de la preview
    const generatePreviewHTML = (data, title) => {
        const getExcelColumnName = (index) => {
            let result = '';
            let num = index;
            while (num >= 0) {
                result = String.fromCharCode(65 + (num % 26)) + result;
                num = Math.floor(num / 26) - 1;
            }
            return result;
        };

        const headers = data[0] || [];
        const rows = data.slice(1);

        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RUNA Data Matcher - ${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }
        
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .stats {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #e9ecef;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        
        .stat-item {
            text-align: center;
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .stat-label {
            font-size: 12px;
            color: #6c757d;
            margin-bottom: 5px;
        }
        
        .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #495057;
        }
        
        .table-container {
            overflow: auto;
            max-height: calc(100vh - 300px);
            padding: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        th, td {
            border: 1px solid #dee2e6;
            text-align: left;
            font-size: 12px;
            max-width: 200px;
        }
        
        th {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            font-weight: bold;
            position: sticky;
            top: 0;
            z-index: 10;
            padding: 8px;
        }
        
        .row-number {
            background: #f8f9fa !important;
            text-align: center;
            font-weight: bold;
            color: #6c757d;
            min-width: 40px;
            padding: 8px;
        }
        
        .excel-column {
            background: #c8e6c9;
            color: #2e7d32;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            text-align: center;
            padding: 4px;
            border-radius: 4px;
            margin-bottom: 4px;
            font-size: 10px;
        }
        
        .column-name {
            font-weight: normal;
            color: #495057;
            padding: 0 4px;
            word-wrap: break-word;
        }
        
        .data-cell {
            padding: 8px;
            word-wrap: break-word;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        tr:hover {
            background-color: #e3f2fd !important;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 15px 20px;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
            border-top: 1px solid #e9ecef;
        }
        
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
            .header { background: #667eea; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 ${title}</h1>
            <p>Vista independiente • Abierto: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-label">📊 Total Registros</div>
                <div class="stat-value">${rows.length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">📋 Total Columnas</div>
                <div class="stat-value">${headers.length}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">🗂️ Tipo de Archivo</div>
                <div class="stat-value">${title.includes('Base') ? 'Plantilla' : title.includes('Fuente') ? 'Datos' : 'Procesado'}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">⏰ Generado</div>
                <div class="stat-value">${new Date().toLocaleTimeString()}</div>
            </div>
        </div>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th class="row-number">#</th>
                        ${headers.map((header, index) => `
                            <th>
                                <div class="excel-column">${getExcelColumnName(index)}</div>
                                <div class="column-name" title="${header || `Columna ${index + 1}`}">
                                    ${header || `Columna ${index + 1}`}
                                </div>
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map((row, rowIndex) => `
                        <tr>
                            <td class="row-number">${rowIndex + 1}</td>
                            ${row.map((cell, cellIndex) => `
                                <td class="data-cell" title="${cell || '-'}">${cell || '-'}</td>
                            `).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>
                📄 RUNA Data Matcher - Generado automáticamente • 
                Total de ${rows.length} registros en ${headers.length} columnas • 
                ${new Date().toLocaleDateString()}
            </p>
        </div>
    </div>
    
    <script>
        // Hacer que la tabla sea más interactiva
        document.addEventListener('DOMContentLoaded', function() {
            const cells = document.querySelectorAll('.data-cell');
            cells.forEach(cell => {
                cell.addEventListener('click', function() {
                    const content = this.textContent;
                    if (content && content !== '-') {
                        navigator.clipboard.writeText(content).then(() => {
                            const originalBg = this.style.backgroundColor;
                            this.style.backgroundColor = '#4caf50';
                            this.style.color = 'white';
                            setTimeout(() => {
                                this.style.backgroundColor = originalBg;
                                this.style.color = '';
                            }, 500);
                        }).catch(() => {
                            // Fallback para navegadores que no soporten clipboard
                            alert('Contenido: ' + content);
                        });
                    }
                });
            });
            
            // Añadir funcionalidad de impresión
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && e.key === 'p') {
                    e.preventDefault();
                    window.print();
                }
            });
        });
    </script>
</body>
</html>`;
    };

    const closeIndependentPreview = (id) => {
        // Buscar y cerrar la ventana específica
        const preview = independentPreviews.find(p => p.id === id);
        if (preview && preview.window) {
            preview.window.close();
        }
        setIndependentPreviews(prev => prev.filter(preview => preview.id !== id));
    };

    const closeAllPreviews = () => {
        independentPreviews.forEach(preview => {
            if (preview.window) {
                preview.window.close();
            }
        });
        setIndependentPreviews([]);
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
                {/* Header */}
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
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    console.log('Estado actual:');
                                    console.log('Base file data:', baseFileData?.length);
                                    console.log('Source file data:', sourceFileData?.length);
                                    console.log('Independent previews:', independentPreviews.length);
                                    console.log('Current step:', currentStep);
                                    console.log('Matching column:', matchingColumnIndex);
                                    console.log('Matching analysis:', matchingAnalysis);
                                }}
                                className="flex items-center gap-2 px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded text-sm text-gray-600"
                            >
                                🐛 Debug
                            </button>
                            <button
                                onClick={resetApp}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <X size={16} />
                                Reiniciar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between max-w-3xl mx-auto mb-4">
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
                            <span className="text-sm font-medium">Campo Matching</span>
                        </div>
                        <ArrowRight className="text-gray-400" size={16} />
                        <div className="flex items-center gap-2">
                            <StepIndicator step={4} isActive={currentStep === 4} isCompleted={currentStep > 4} />
                            <span className="text-sm font-medium">Mapeo Columnas</span>
                        </div>
                        <ArrowRight className="text-gray-400" size={16} />
                        <div className="flex items-center gap-2">
                            <StepIndicator step={5} isActive={currentStep === 5} isCompleted={currentStep > 5} />
                            <span className="text-sm font-medium">Descarga</span>
                        </div>
                    </div>

                    {/* Indicator de ventanas independientes */}
                    {independentPreviews.length > 0 && (
                        <div className="text-center">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm">
                                <span>📋</span>
                                <span>{independentPreviews.length} ventana{independentPreviews.length > 1 ? 's' : ''} independiente{independentPreviews.length > 1 ? 's' : ''} abierta{independentPreviews.length > 1 ? 's' : ''}</span>
                                <button
                                    onClick={closeAllPreviews}
                                    className="ml-2 px-2 py-1 bg-red-200 text-red-700 rounded hover:bg-red-300 text-xs"
                                    title="Cerrar todas las ventanas"
                                >
                                    ✕ Cerrar todas
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {/* Step 1: Upload Base File */}
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

                    {/* Step 2: Upload Source File */}
                    {currentStep === 2 && (
                        <div className="text-center">
                            <div className="mb-8">
                                <div className="flex items-center justify-center gap-4 mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                    <div className="text-center">
                                        <span className="text-green-600 font-medium block">
                                            Archivo base cargado: {baseFile?.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            📋 {baseFileData ? baseFileData.length - 1 : 0} registros de datos (segunda fila eliminada automáticamente)
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => showDataPreview(baseFileData, 'Archivo Base')}
                                            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
                                        >
                                            <Eye size={14} />
                                            Ver
                                        </button>
                                        <button
                                            onClick={() => openIndependentPreview(baseFileData, 'Archivo Base')}
                                            className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-600 rounded text-sm hover:bg-green-200"
                                            title="Abrir en ventana independiente"
                                        >
                                            📋
                                        </button>
                                    </div>
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

                    {/* Step 3: Select Matching Field */}
                    {currentStep === 3 && baseFileData && sourceFileData && (
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
                                    Selecciona la columna del archivo fuente que contiene el <strong>ID de empleado</strong>
                                    para hacer el matching con el archivo base. Este campo será la clave para vincular los datos.
                                </p>
                            </div>

                            <div className="max-w-4xl mx-auto">
                                <div className="grid md:grid-cols-2 gap-8 mb-8">
                                    {/* Archivo Base - Campo ID */}
                                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                                            📋 Campo de Matching en Archivo Base
                                        </h3>
                                        <div className="bg-white rounded-lg p-4 border border-yellow-300">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 bg-yellow-200 text-yellow-800 rounded text-sm flex items-center justify-center font-mono font-bold">
                                                    A
                                                </span>
                                                <div>
                                                    <div className="font-semibold text-gray-800">{baseFileData[0]?.[0]}</div>
                                                    <div className="text-sm text-gray-600">Primera columna del archivo base</div>
                                                </div>
                                                <span className="ml-auto px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                                    🔑 Campo Clave
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                                            <p className="text-sm text-yellow-800">
                                                <strong>Total de empleados:</strong> {baseFileData ? baseFileData.length - 1 : 0}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Archivo Fuente - Selección */}
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                                            🎯 Seleccionar Campo Correspondiente
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-blue-800 mb-2">
                                                    ¿En qué columna del archivo fuente está el ID de empleado?
                                                </label>
                                                <select
                                                    value={matchingColumnIndex !== null ? matchingColumnIndex.toString() : ''}
                                                    onChange={(e) => {
                                                        const index = e.target.value !== '' ? parseInt(e.target.value) : null;
                                                        setMatchingColumnIndex(index);
                                                        if (index !== null) {
                                                            analyzeMatching(index);
                                                        } else {
                                                            setMatchingAnalysis(null);
                                                        }
                                                    }}
                                                    className="w-full p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                >
                                                    <option value="">-- Seleccionar columna del archivo fuente --</option>
                                                    {sourceFileData[0]?.map((sourceCol, sourceIndex) => (
                                                        <option key={sourceIndex} value={sourceIndex.toString()}>
                                                            Columna {(() => {
                                                                let result = '';
                                                                let num = sourceIndex;
                                                                while (num >= 0) {
                                                                    result = String.fromCharCode(65 + (num % 26)) + result;
                                                                    num = Math.floor(num / 26) - 1;
                                                                }
                                                                return result;
                                                            })()} - {sourceCol}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {matchingColumnIndex !== null && (
                                                <div className="bg-white rounded-lg p-4 border border-blue-300">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-8 h-8 bg-blue-200 text-blue-800 rounded text-sm flex items-center justify-center font-mono font-bold">
                                                            {(() => {
                                                                let result = '';
                                                                let num = matchingColumnIndex;
                                                                while (num >= 0) {
                                                                    result = String.fromCharCode(65 + (num % 26)) + result;
                                                                    num = Math.floor(num / 26) - 1;
                                                                }
                                                                return result;
                                                            })()}
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
                                                    <>
                                                        <span className="text-green-600">✅ Análisis de Matching Completado</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-orange-600">⚠️ Análisis de Matching - Atención Requerida</span>
                                                    </>
                                                )}
                                            </h3>

                                            <div className="grid md:grid-cols-3 gap-6 mb-6">
                                                <div className="bg-white rounded-lg p-4 text-center">
                                                    <div className="text-2xl font-bold text-blue-600">{matchingAnalysis.totalCount}</div>
                                                    <div className="text-sm text-gray-600">Total Empleados</div>
                                                    <div className="text-xs text-gray-500">En archivo base</div>
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
                                                                <span className="font-medium text-orange-800">ID: {item.id}</span>
                                                                {item.name && <span className="text-orange-600">- {item.name}</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-orange-700 mt-2">
                                                        💡 Estos empleados no tienen datos correspondientes en el archivo fuente y mantendrán solo sus datos del archivo base.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                    >
                                        ← Volver
                                    </button>
                                    <button
                                        onClick={() => setCurrentStep(4)}
                                        disabled={matchingColumnIndex === null}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        title={matchingColumnIndex === null ? "Selecciona la columna de matching primero" : "Continuar al mapeo de columnas"}
                                    >
                                        Continuar al Mapeo →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Column Mapping */}
                    {currentStep === 4 && baseFileData && sourceFileData && matchingColumnIndex !== null && (
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
                                                            {(() => {
                                                                let result = '';
                                                                let num = index;
                                                                while (num >= 0) {
                                                                    result = String.fromCharCode(65 + (num % 26)) + result;
                                                                    num = Math.floor(num / 26) - 1;
                                                                }
                                                                return result;
                                                            })()}
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
                                                {(() => {
                                                    let result = '';
                                                    let num = matchingColumnIndex;
                                                    while (num >= 0) {
                                                        result = String.fromCharCode(65 + (num % 26)) + result;
                                                        num = Math.floor(num / 26) - 1;
                                                    }
                                                    return result;
                                                })()}
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
                                                        {(() => {
                                                            let result = '';
                                                            let num = index + 1;
                                                            while (num >= 0) {
                                                                result = String.fromCharCode(65 + (num % 26)) + result;
                                                                num = Math.floor(num / 26) - 1;
                                                            }
                                                            return result;
                                                        })()}
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
                                                        {(() => {
                                                            let result = '';
                                                            let num = realIndex;
                                                            while (num >= 0) {
                                                                result = String.fromCharCode(65 + (num % 26)) + result;
                                                                num = Math.floor(num / 26) - 1;
                                                            }
                                                            return result;
                                                        })()}
                                                    </span>
                                                    <span className="w-32 text-sm text-blue-800 font-medium truncate" title={col}>
                                                        {col}:
                                                    </span>
                                                    <select
                                                        value={mapping[col] !== undefined ? (mapping[col] === 'ZERO_VALUE' ? 'ZERO_VALUE' : mapping[col].toString()) : ''}
                                                        onChange={(e) => handleMapping(col, e.target.value)}
                                                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="">-- Seleccionar columna --</option>
                                                        <option value="ZERO_VALUE" className="bg-yellow-50 text-yellow-800 font-medium">
                                                            🔢 Sin valor existente (0)
                                                        </option>
                                                        {sourceFileData[0]?.map((sourceCol, sourceIndex) => (
                                                            <option key={sourceIndex} value={sourceIndex.toString()}>
                                                                {sourceCol} (Columna {(() => {
                                                                    let result = '';
                                                                    let num = sourceIndex;
                                                                    while (num >= 0) {
                                                                        result = String.fromCharCode(65 + (num % 26)) + result;
                                                                        num = Math.floor(num / 26) - 1;
                                                                    }
                                                                    return result;
                                                                })()})
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
                                        onClick={() => setCurrentStep(3)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                    >
                                        ← Campo Matching
                                    </button>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => showDataPreview(baseFileData, 'Archivo Base')}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                        >
                                            <Eye size={16} />
                                            Ver Base
                                        </button>
                                        <button
                                            onClick={() => openIndependentPreview(baseFileData, 'Archivo Base')}
                                            className="flex items-center gap-1 px-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                            title="Abrir Archivo Base en ventana independiente"
                                        >
                                            📋
                                        </button>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => showDataPreview(sourceFileData, 'Archivo Fuente')}
                                            className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
                                        >
                                            <Eye size={16} />
                                            Ver Fuente
                                        </button>
                                        <button
                                            onClick={() => openIndependentPreview(sourceFileData, 'Archivo Fuente')}
                                            className="flex items-center gap-1 px-2 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100"
                                            title="Abrir Archivo Fuente en ventana independiente"
                                        >
                                            📋
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={processData}
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
                                                {Object.values(mapping).filter(val => val === 'ZERO_VALUE').length > 0 && (
                                                    <span className="ml-1">({Object.values(mapping).filter(val => val === 'ZERO_VALUE').length} con 0)</span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Download Results */}
                    {currentStep === 5 && processedData && (
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
                                                {sourceCol === 'ZERO_VALUE' ? (
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                                                        🔢 Valor: 0
                                                    </span>
                                                ) : (
                                                    <span className="text-blue-600 font-medium">
                                                        {sourceFileData[0]?.[sourceCol]} (Col {(() => {
                                                            let result = '';
                                                            let num = sourceCol;
                                                            while (num >= 0) {
                                                                result = String.fromCharCode(65 + (num % 26)) + result;
                                                                num = Math.floor(num / 26) - 1;
                                                            }
                                                            return result;
                                                        })()})
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
                                    onClick={() => setCurrentStep(4)}
                                    className="flex items-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                    title="Volver al paso de mapeo para ajustar configuración"
                                >
                                    <ArrowRight size={16} className="rotate-180" />
                                    ⚙️ Ajustar Mapping
                                </button>

                                <button
                                    onClick={() => showDataPreview(processedData, 'Datos Procesados')}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    <Eye size={16} />
                                    Vista Previa
                                </button>

                                <button
                                    onClick={() => openIndependentPreview(processedData, 'Datos Procesados')}
                                    className="flex items-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                                    title="Abrir en ventana independiente"
                                >
                                    📋 Vista Independiente
                                </button>

                                <button
                                    onClick={downloadProcessedFile}
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
                    )}
                </div>

                {/* Preview Modal */}
                {showPreview && previewData && (
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
                                        onClick={() => openIndependentPreview(previewData.data, previewData.title)}
                                        className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 text-sm"
                                        title="Abrir en ventana independiente"
                                    >
                                        📋 Independiente
                                    </button>
                                    <button
                                        onClick={() => setShowPreview(false)}
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
                                                                {(() => {
                                                                    let result = '';
                                                                    let num = index;
                                                                    while (num >= 0) {
                                                                        result = String.fromCharCode(65 + (num % 26)) + result;
                                                                        num = Math.floor(num / 26) - 1;
                                                                    }
                                                                    return result;
                                                                })()}
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
                )}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                    <span className="text-sm text-gray-600">RUNA Data Matcher</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-sm font-mono text-blue-600 font-medium">{APP_VERSION}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{new Date().getFullYear()}</span>
                </div>
            </div>
        </div>
    );
};

export default RunaDataMatcher;