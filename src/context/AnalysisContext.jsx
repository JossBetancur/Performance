import React, { createContext, useContext, useState } from 'react';

const AnalysisContext = createContext();

export const useAnalysis = () => {
    return useContext(AnalysisContext);
};

export const AnalysisProvider = ({ children }) => {
    const [analysisState, setAnalysisState] = useState({
        inProgress: false,
        progress: 0,
        totalUrls: 0,
        results: JSON.parse(localStorage.getItem('analysisResults')) || []
    });

    const [abortController, setAbortController] = useState(null);

    const startAnalysis = (totalUrls) => {
        setAnalysisState({ inProgress: true, progress: 0, totalUrls, results: [] });
        
        const controller = new AbortController();
        setAbortController(controller);

        return controller.signal;
    };

    const updateProgress = (progress) => {
        setAnalysisState(prevState => ({ ...prevState, progress }));
    };

    const setResults = (results) => {
        setAnalysisState(prevState => ({ ...prevState, results }));
        localStorage.setItem('analysisResults', JSON.stringify(results));
    };

    const cancelAnalysis = () => {
        setAnalysisState(prevState => ({ ...prevState, inProgress: false, progress: 0, totalUrls: 0 }));
    };

    return (
        <AnalysisContext.Provider
            value={{ analysisState, startAnalysis, updateProgress, setResults, cancelAnalysis }}
        >
            {children}
        </AnalysisContext.Provider>
    );
};
