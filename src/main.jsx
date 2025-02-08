import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { AnalysisProvider } from "./context/AnalysisContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
        <AuthProvider>
            <AnalysisProvider >
              <App />
            </AnalysisProvider>
        </AuthProvider>
    </Router>
  </React.StrictMode>
);