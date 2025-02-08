import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const UrlManager = () => {
  //Administrar URL
  const [newUrl, setNewUrl] = useState("");
  const [urlType, setUrlType] = useState("cms");
  const [cmsUrls, setCmsUrls] = useState([]);
  const [lpsUrls, setLpsUrls] = useState([]);
  const navigate = useNavigate();
  const location = useLocation(); 

  const handleAddUrl = async () => {
    if (newUrl.trim() === "") return;
  
    try {
      const response = await axios.post('/api/dynamics', {
        url: newUrl,
        type: urlType,
      });

      fetchUrls();
  
      setNewUrl("");
    } catch (error) {
      console.error("Error al agregar la URL:", error.response ? error.response.data : error);
    }
  };

 const fetchUrls = async () => {
  try {
    const [cmsResponse, lpsResponse] = await Promise.all([
      axios.get('/api/url/cms'),
      axios.get('/api/url/lps'),
    ]);

    setCmsUrls(cmsResponse.data); 
    setLpsUrls(lpsResponse.data); 
  } catch (error) {
    console.error("Error al obtener las URLs:", error.response ? error.response.data : error);
  }
};
  
  useEffect(() => {
    fetchUrls();
  }, [location]);

  const handleNavigateToAnalysis = () => {
    navigate('/analysis');
  };

  const handleDeleteUrl = async (id, type) => {
    try {
      await axios.delete(`/api/url/${id}`);

      fetchUrls();
    } catch (error) {
      console.error('Error al eliminar la URL:', error.response ? error.response.data : error);
    }
  };
  

  return (
    <div className="p-8 max-w-4xl mx-auto shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center text-white mb-6">Gestión de URL</h1>

      <div className="mb-8">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <label className="text-lg mr-3 text-white">Tipo de URL:</label>
            <select
              className="border border-gray-300 p-2 rounded-lg w-1/8"
              value={urlType}
              onChange={(e) => setUrlType(e.target.value)}
            >
              <option value="cms">CMS</option>
              <option value="lps">LPS</option>
            </select>
          </div>

          <input
            type="text"
            className="border border-gray-300 p-3 rounded-lg w-full text-white"
            placeholder="Ingrese la URL aquí"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />

          <button
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleAddUrl}
          >
            Agregar URL
          </button>
        </div>
      </div>

      <div className="mb-8 mt-20">
        <h3 className="text-2xl text-gray-400 mb-4">Url CMS</h3>
        <div className="overflow-x-auto w-full">
  <table className="min-w-full table-auto bg-white overflow-hidden">
    <thead>
      <tr className="text-center text-neutral-950 bg-gray-200">
        <th className="px-4 py-2 font-light">URL</th>
        <th className="px-4 py-2 font-light">TIPO</th>
        <th className="px-4 py-2 font-light">FECHA</th>
        <th className="px-4 py-2 font-light"></th>
      </tr>
    </thead>
    <tbody>
      {cmsUrls.length === 0 ? (
        <tr>
          <td colSpan="4" className="px-4 py-2 text-center text-neutral-950">
            No hay Url CMS agregadas.
          </td>
        </tr>
      ) : (
        cmsUrls.map((url, index) => (
          <tr className="text-center" key={index}>
            <td className="px-4 py-2 text-neutral-950 max-w-xs truncate overflow-hidden whitespace-nowrap">
              {url.url}
            </td>
            <td className="px-4 py-2 text-neutral-950 md:w-1/4">{url.type}</td>
            <td className="px-4 py-2 text-neutral-950 md:w-1/4">
              {new Date(url.created_at).toLocaleDateString("es-ES")}
            </td>
            <td className="md:w-1/4">
              <button
                className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => handleDeleteUrl(url.id, "cms")}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

      </div>

      <div>
        <h3 className="text-2xl text-gray-400 mb-4">Url LPS</h3>
        <div className="overflow-x-auto w-full">
  <table className="min-w-full table-auto bg-white overflow-hidden">
    <thead>
      <tr className="text-center text-gray-700 bg-gray-200">
        <th className="px-4 py-2 font-light">URL</th>
        <th className="px-4 py-2 font-light">TIPO</th>
        <th className="px-4 py-2 font-light">FECHA</th>
        <th className="px-4 py-2 font-light"></th>
      </tr>
    </thead>
    <tbody>
      {lpsUrls.length === 0 ? (
        <tr>
          <td colSpan="4" className="px-4 py-2 text-center text-neutral-950">
            No hay Url LPS agregadas.
          </td>
        </tr>
      ) : (
        lpsUrls.map((url, index) => (
          <tr className="text-center" key={index}>
            <td className="px-4 py-2 text-neutral-950 max-w-xs truncate overflow-hidden whitespace-nowrap">
              {url.url}
            </td>
            <td className="px-4 py-2 text-neutral-950 md:w-1/4">{url.type}</td>
            <td className="px-4 py-2 text-neutral-950 md:w-1/4">
              {new Date(url.created_at).toLocaleDateString("es-ES")}
            </td>
            <td className="md:w-1/4">
              <button
                className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => handleDeleteUrl(url.id, "lps")}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>


      </div>

      <div className="mt-6 flex justify-center">
        <button
          className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors"
          onClick={handleNavigateToAnalysis}
        >
          Ir al Análisis
        </button>
      </div>
    </div>
  );
};

export default UrlManager;
