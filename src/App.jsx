import React, { useState } from 'react';

// Components
import Header from './components/Header.jsx';
import StepIndicatorContainer from './components/StepIndicator.jsx';
import PreviewModal from './components/PreviewModal.jsx';
import Footer from './components/Footer.jsx';

// Step Components
import Step1Upload from './components/steps/Step1Upload.jsx';
import Step2Upload from './components/steps/Step2Upload.jsx';
import Step3Matching from './components/steps/Step3Matching.jsx';
import Step4Mapping from './components/steps/Step4Mapping.jsx';
import Step5Download from './components/steps/Step5Download.jsx';

// Hooks
import { useFileUpload } from './hooks/useFileUpload.js';
import { useMatching } from './hooks/useMatching.js';
import { useMapping } from './hooks/useMapping.js';
import { useProcessing } from './hooks/useProcessing.js';
import { usePreview } from './hooks/usePreview.js';

// Constants
import { STEPS } from './utils/constants.js';

const RunaDataMatcher = () => {
    const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD_BASE);

    // File upload hook
    const {
        baseFile,
        sourceFile,
        baseFileData,
        sourceFileData,
        handleFileUpload,
        resetFiles
    } = useFileUpload();

    // Matching hook
    const {
        matchingColumnIndex,
        matchingAnalysis,
        matchingFieldType,
        updateMatchingColumn,
        updateMatchingFieldType,
        resetMatching
    } = useMatching();

    // Mapping hook
    const {
        mapping,
        handleMapping,
        resetMapping
    } = useMapping();

    // Processing hook
    const {
        processedData,
        processData,
        downloadProcessedFile,
        resetProcessedData
    } = useProcessing();

    // Preview hook
    const {
        showPreview,
        previewData,
        independentPreviews,
        showDataPreview,
        openIndependentPreview,
        closeAllPreviews,
        setShowPreview,
        resetPreview
    } = usePreview();

    // File upload handler
    const onFileUpload = async (file, type) => {
        const result = await handleFileUpload(file, type);
        if (result.success) {
            setCurrentStep(result.step);
        }
    };

    // Matching handlers
    const onFieldTypeChange = (fieldType) => {
        updateMatchingFieldType(baseFileData, sourceFileData, fieldType);
    };

    const onColumnChange = (columnIndex) => {
        updateMatchingColumn(baseFileData, sourceFileData, columnIndex);
    };

    // Processing handler
    const handleProcessData = () => {
        const result = processData(
            baseFileData,
            sourceFileData,
            mapping,
            matchingColumnIndex,
            matchingFieldType
        );
        if (result) {
            setCurrentStep(STEPS.DOWNLOAD_RESULTS);
        }
    };

    // Reset application
    const resetApp = () => {
        resetFiles();
        resetMatching();
        resetMapping();
        resetProcessedData();
        resetPreview();
        setCurrentStep(STEPS.UPLOAD_BASE);
    };

    // Navigation handlers
    const goToStep = (step) => {
        setCurrentStep(step);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <Header
                    onReset={resetApp}
                    baseFileData={baseFileData}
                    sourceFileData={sourceFileData}
                    independentPreviews={independentPreviews}
                    currentStep={currentStep}
                    matchingColumnIndex={matchingColumnIndex}
                    matchingAnalysis={matchingAnalysis}
                />

                {/* Step Indicator */}
                <StepIndicatorContainer
                    currentStep={currentStep}
                    independentPreviews={independentPreviews}
                    closeAllPreviews={closeAllPreviews}
                />

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {currentStep === STEPS.UPLOAD_BASE && (
                        <Step1Upload onFileUpload={onFileUpload} />
                    )}

                    {currentStep === STEPS.UPLOAD_SOURCE && (
                        <Step2Upload
                            baseFile={baseFile}
                            baseFileData={baseFileData}
                            onFileUpload={onFileUpload}
                            onShowPreview={showDataPreview}
                            onOpenIndependent={openIndependentPreview}
                        />
                    )}

                    {currentStep === STEPS.CONFIGURE_MATCHING && baseFileData && sourceFileData && (
                        <Step3Matching
                            baseFileData={baseFileData}
                            sourceFileData={sourceFileData}
                            matchingFieldType={matchingFieldType}
                            matchingColumnIndex={matchingColumnIndex}
                            matchingAnalysis={matchingAnalysis}
                            onFieldTypeChange={onFieldTypeChange}
                            onColumnChange={onColumnChange}
                            onBack={() => goToStep(STEPS.UPLOAD_SOURCE)}
                            onContinue={() => goToStep(STEPS.COLUMN_MAPPING)}
                        />
                    )}

                    {currentStep === STEPS.COLUMN_MAPPING && baseFileData && sourceFileData && matchingColumnIndex !== null && (
                        <Step4Mapping
                            baseFileData={baseFileData}
                            sourceFileData={sourceFileData}
                            matchingColumnIndex={matchingColumnIndex}
                            matchingAnalysis={matchingAnalysis}
                            mapping={mapping}
                            onMapping={handleMapping}
                            onBack={() => goToStep(STEPS.CONFIGURE_MATCHING)}
                            onProcess={handleProcessData}
                            onShowPreview={showDataPreview}
                            onOpenIndependent={openIndependentPreview}
                        />
                    )}

                    {currentStep === STEPS.DOWNLOAD_RESULTS && processedData && (
                        <Step5Download
                            processedData={processedData}
                            baseFileData={baseFileData}
                            sourceFileData={sourceFileData}
                            mapping={mapping}
                            matchingAnalysis={matchingAnalysis}
                            onBack={() => goToStep(STEPS.COLUMN_MAPPING)}
                            onDownload={downloadProcessedFile}
                            onShowPreview={showDataPreview}
                            onOpenIndependent={openIndependentPreview}
                        />
                    )}
                </div>

                {/* Preview Modal */}
                <PreviewModal
                    showPreview={showPreview}
                    previewData={previewData}
                    onClose={() => setShowPreview(false)}
                    onOpenIndependent={openIndependentPreview}
                />

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
};

export default RunaDataMatcher;