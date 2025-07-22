import React, { useRef } from 'react';
import { Upload, FileText, CheckCircle, Eye } from 'lucide-react';

const Step2Upload = ({
    baseFile,
    baseFileData,
    onFileUpload,
    onShowPreview,
    onOpenIndependent
}) => {
    const fileRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            onFileUpload(e.target.files[0], 'source');
        }
    };

    return (
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
                            onClick={() => onShowPreview(baseFileData, 'Archivo Base')}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
                        >
                            <Eye size={14} />
                            Ver
                        </button>
                        <button
                            onClick={() => onOpenIndependent(baseFileData, 'Archivo Base')}
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
                onClick={() => fileRef.current?.click()}
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
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};

export default Step2Upload;