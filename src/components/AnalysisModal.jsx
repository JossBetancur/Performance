import React from 'react';
import { useAnalysis } from "../context/AnalysisContext";

const AnalysisModal = () => {
    //Modal ejecucion en segundo plano
    const { analysisState, cancelAnalysis } = useAnalysis();

    return (
        analysisState.inProgress && (
            <div className="fixed bottom-4 right-4 bg-gray-800 p-4 shadow-lg rounded-lg z-50">
                <p>Progreso: {analysisState.progress} de {analysisState.totalUrls} procesadas.</p>
                <progress value={analysisState.progress} max={analysisState.totalUrls} className="w-full mb-2" />
                <button
                    onClick={cancelAnalysis}
                    className="bg-red-500 text-white py-1 px-4 rounded"
                >
                    Cerrar
                </button>
            </div>
        )
    );
};

export default AnalysisModal;
