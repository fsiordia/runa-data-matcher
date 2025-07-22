import React from 'react';
import { X } from 'lucide-react';
import { APP_VERSION } from '../utils/constants.js';

const Header = ({ 
  onReset, 
  onDebug, 
  baseFileData, 
  sourceFileData, 
  independentPreviews, 
  currentStep,
  matchingColumnIndex,
  matchingAnalysis 
}) => {
  const handleDebug = () => {
    console.log('Estado actual:');
    console.log('Base file data:', baseFileData?.length);
    console.log('Source file data:', sourceFileData?.length);
    console.log('Independent previews:', independentPreviews.length);
    console.log('Current step:', currentStep);
    console.log('Matching column:', matchingColumnIndex);
    console.log('Matching analysis:', matchingAnalysis);
    if (onDebug) onDebug();
  };

  return (
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
            onClick={handleDebug}
            className="flex items-center gap-2 px-3 py-1 bg-gray-50 hover:bg-gray-100 rounded text-sm text-gray-600"
          >
            🐛 Debug
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={16} />
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;