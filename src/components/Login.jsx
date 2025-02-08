import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleLogin } from '@react-oauth/google';

function Login({ isRegister }) {
    const [isRegisterMode, setIsRegisterMode] = useState(isRegister);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        setIsRegisterMode(isRegister);
    }, [isRegister, navigate]);

    const handleAccountClick = () => {
        navigate(isRegisterMode ? '/' : '/register'); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
    
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
        if (isRegisterMode && password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            setIsLoading(false); 
            return;
        }
    
        const url = isRegisterMode
            ? '/api/register'
            : '/api/login';
    
        const data = isRegisterMode
            ? { email, password, password_confirmation: confirmPassword }
            : { email, password };
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(data),
            });
    
            setIsLoading(false); 
    
            if (response.ok) {
                const result = await response.json();
                
                if (isRegisterMode) {
                    toast.success(result.message);
                    navigate('/inicio'); 
                } else {
                    localStorage.setItem('user', JSON.stringify(result.user));
                    login(result.token);
                    toast.success(result.message);
                    navigate('/inicio');
                    window.location.reload();
                }
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Ocurrió un error');
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error al realizar la solicitud:', error);
            toast.error('Error de conexión');
        }
    };    

    return (
        <div className="flex w-full max-w-sm mx-auto -mt-10 overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800 lg:max-w-4xl">
            <div 
                className="hidden bg-cover lg:block lg:w-1/2" 
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1720962158813-29b66b8e23e1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')` }}>
            </div>

            <div className="w-full px-6 py-8 md:px-8 lg:w-1/2">
                <div className="flex justify-center mx-auto">
                    <img className="w-auto h-7 sm:h-8" src="iconPerformance.png" alt="Logo" />
                </div>

                <p className="mt-3  mb-10 text-xl text-center text-gray-600 dark:text-gray-200">
                     {"Bienvenido de nuevo!"}
                </p>

                <div className="mt-4">
                    <form onSubmit={handleSubmit}>
                        <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200" htmlFor="emailAddress">Correo electronico</label>
                        <input 
                            id="emailAddress" 
                            className="block w-full px-4 py-2 mb-10 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300" 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                        <div className="mt-4">
                            <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200" htmlFor="password">Contraseña</label>
                            <input 
                                id="password" 
                                className="block w-full px-4 py-2 mb-10 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300" 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>

                        <div className="mt-6">
                            <button className="w-full px-6 py-3 mb-6 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50" disabled={isLoading}>
                                {isLoading ? 'Cargando...' : ("Iniciar sesión")}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
            <ToastContainer /> 
        </div>
    );
}

export default Login;
