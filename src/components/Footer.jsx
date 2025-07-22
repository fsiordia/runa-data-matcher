import React from 'react';
import { APP_VERSION } from '../utils/constants.js';

const Footer = () => {
    return (
        <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                <span className="text-sm text-gray-600">RUNA Data Matcher</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-sm font-mono text-blue-600 font-medium">{APP_VERSION}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{new Date().getFullYear()}</span>
            </div>
        </div>
    );
};

export default Footer;