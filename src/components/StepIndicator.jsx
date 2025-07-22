import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

const StepIndicator = ({ step, isActive, isCompleted }) => (
    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${isCompleted ? 'bg-green-500 text-white' :
        isActive ? 'bg-blue-500 text-white' :
            'bg-gray-300 text-gray-600'
        }`}>
        {isCompleted ? <CheckCircle size={16} /> : step}
    </div>
);

const StepIndicatorContainer = ({ currentStep, independentPreviews, closeAllPreviews }) => {
    return (
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
    );
};

export default StepIndicatorContainer;