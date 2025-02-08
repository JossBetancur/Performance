import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { navBar } from "../constants";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { isLoggedIn, token, logout } = useAuth();
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === "admin";

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const filteredNavItems = navBar.filter(item => {
    if (item.requiresAuth && !user) return false;
    
    if (item.requiresAdmin && isAdmin === false) return false;

    return true;
  });

  return (
    <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-700/80">
      <div className="container px-4 mx-auto relative lg:text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0">
            <span className="text-xl tracking-tight">Utel Performance</span>
          </div>
          <div className="hidden lg:flex justify-center space-x-12 items-center">
          <ul className="hidden lg:flex ml-14 space-x-12">
              {filteredNavItems.map((item, index) => (
                <li key={index}>
                  <Link to={item.href}>{item.label}</Link>
                </li>
              ))}
          </ul>
            {isLoggedIn ? (
              <Link
                to="/"
                onClick={() => {
                  logout();
                  setMobileDrawerOpen(false);
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 py-2 px-3 rounded-md"
              >
                Cerrar sesión
              </Link>
            ) : (
              <Link
                to="/"
                className="bg-gradient-to-r from-orange-500 to-orange-600 py-2 px-3 rounded-md"
              >
                Iniciar sesion
              </Link>
            )}
          </div>
          <div className="lg:hidden md:flex flex-col justify-end">
            <button onClick={toggleNavbar}>
              {mobileDrawerOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {mobileDrawerOpen && (
          <div className="fixed right-0 z-20 bg-neutral-900 w-full p-12 flex flex-col justify-center items-center lg:hidden">
            <ul>
            {filteredNavItems.map((item, index) => (
                <li key={index}>
                  <Link to={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
            <div className="flex space-x-6">
              {isLoggedIn ? (
                <Link
                  to="/"
                  onClick={() => {
                    logout();
                    setMobileDrawerOpen(false);
                  }}
                  className="py-2 px-3 rounded-md bg-gradient-to-r from-red-500 to-red-600"
                >
                  Cerrar sesión
                </Link>
              ) : (
                <Link
                    to="/"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-orange-800"
                >
                    Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
