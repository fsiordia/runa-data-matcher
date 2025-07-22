import React, { useRef } from 'react';
import { Upload, FileText } from 'lucide-react';

const Step1Upload = ({ onFileUpload }) => {
    const fileRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            onFileUpload(e.target.files[0], 'base');
        }
    };

    return (
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
                onClick={() => fileRef.current?.click()}
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
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};
