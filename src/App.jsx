import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Workflow from "./components/Workflow";
import Footer from "./components/Footer";
import Analysis from "./components/Analysis";
import Login from "./components/Login";
import DatabaseData from "./components/DatabaseData";
import Metrics from "./components/DiagnosticsTable";
import { useLocalStorage } from "react-use";
import UrlManager from "./components/UrlManager";
import AnalysisModal from "./components/AnalysisModal";
import { useAnalysis } from "./context/AnalysisContext";
import ChartPage from "./components/ChartPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PageNotFound from "./components/PageNotFound";

const ScrollToHash = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const element = document.getElementById(location.hash.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [location]);

    return null;
};

const App = () => {
    const navigate = useNavigate();
    const [user, setUser] = useLocalStorage("user");
    const { analysisState } = useAnalysis();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser(storedUser);
    }, [setUser]);

    const isAuthenticated = Boolean(user);
    const isAdmin = user?.role === "admin";

    useEffect(() => {
        if (isAuthenticated && window.location.pathname === "/") {
            navigate("/inicio");
        }
    }, [isAuthenticated, navigate]);

    return (
        <>
            <ScrollToHash />
            <Navbar />
            <div className="max-w-7xl mx-auto pt-20 px-6">
                <Routes>
                    <Route
                        path="/inicio"
                        element={
                            <>
                                <HeroSection />
                                <Workflow />
                            </>
                        }
                    />
                    <Route
                        path="/analysis"
                        element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <Analysis />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/database-data"
                        element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <DatabaseData />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/performance-metrics"
                        element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <Metrics />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/" element={<Login />} />
                    {isAdmin && (
                        <Route
                            path="/dynamics"
                            element={
                                <ProtectedRoute isAuthenticated={isAuthenticated}>
                                    <UrlManager />
                                </ProtectedRoute>
                            }
                        />
                    )}

                    <Route
                        path="/chart"
                        element={
                            <ProtectedRoute isAuthenticated={isAuthenticated}>
                                <ChartPage />
                            </ProtectedRoute>
                        }
                    />
                     <Route path="*" element={<PageNotFound isAuthenticated={isAuthenticated} />} />
                </Routes>
                <Footer />
            </div>
            <AnalysisModal />
        </>
    );
};

export default App;
