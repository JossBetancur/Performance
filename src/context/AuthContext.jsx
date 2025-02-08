import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AnalysisContext = createContext();

export const useAnalysis = () => useContext(AnalysisContext);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    
    useEffect(() => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

    if (!storedToken || !storedUser) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      return;
    }

    try {
      const userData =
        storedUser !== "undefined" && storedUser !== "null"
          ? JSON.parse(storedUser)
          : null;

      setToken(storedToken);
      setUser(userData || {});
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Error al parsear el usuario desde localStorage:", error);
      setIsLoggedIn(false);
    }
  }, []);
    
    const login = (userToken, userUser) => {
        if (userToken && userUser) {
            setToken(userToken);
            setUser(userUser);
            localStorage.setItem('token', userToken);
            localStorage.setItem('user', JSON.stringify(userUser));
            setIsLoggedIn(true);
        } else if (userToken) {
            setToken(userToken);
            localStorage.setItem('token', userToken);
            setIsLoggedIn(true);
        } else {
            console.error("Datos de usuario o token no válidos para login.");
        }
    };
    
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        cancelAnalysis();
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
