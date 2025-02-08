import React from "react";
import { Link } from "react-router-dom";
import notFoundImage from "../assets/404.png";

const PageNotFound = ({ isAuthenticated }) => {

  return (
    <div className="h-96 flex flex-col justify-center items-center">
      <div className="flex items-center text-blue-600 text-6xl font-bold gap-4">
        <span className="text-9xl text-[#33bbcf]">4</span>
        <img
          src={notFoundImage}
          alt="404 - Page Not Found"
          className="w-44"
        />
        <span className="text-9xl text-[#33bbcf]">4</span>
      </div>
      <p className="text-xl mt-4 text-gray-200">Página no encontrada</p>

      <Link
        to={isAuthenticated ? "/inicio" : "/"}
        className="mt-6 px-4 py-2 bg-orange-700 text-white rounded hover:bg-orange-800 transition"
      >
        Volver al Inicio
      </Link>
    </div>
  );
};

export default PageNotFound;
