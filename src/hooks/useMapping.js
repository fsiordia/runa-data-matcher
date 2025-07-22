import { useState } from 'react';
import { ZERO_VALUE_KEY, MATCHING_FIELD_TYPES } from '../utils/constants.js';

export const useMapping = () => {
    const [mapping, setMapping] = useState({});

    const handleMapping = (baseCol, sourceCol) => {
        console.log('Mapping:', baseCol, 'to source column index:', sourceCol);

        if (sourceCol === ZERO_VALUE_KEY) {
            // Opción especial para llenar con ceros
            setMapping(prev => ({
                ...prev,
                [baseCol]: ZERO_VALUE_KEY
            }));
        } else {
            setMapping(prev => ({
                ...prev,
                [baseCol]: sourceCol !== '' ? parseInt(sourceCol) : undefined
            }));
        }
    };

    const resetMapping = () => {
        setMapping({});
    };

    return {
        mapping,
        handleMapping,
        resetMapping
    };
};
