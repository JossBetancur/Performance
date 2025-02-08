import React, { useState, useEffect } from "react";
import axios from "axios";

// Modal para mostrar los detalles del diagnóstico
const DiagnosticModal = ({ isOpen, onClose, diagnostic }) => {
    if (!isOpen) return null;
  
    const convertTextToLinks = (text) => {
      if (!text) return text;
  
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return text.split(urlRegex).map((part, idx) => 
        urlRegex.test(part) ? (
          <a key={idx} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {part}
          </a>
        ) : (
          part
        )
      );
    };
  
    const hasDetails = diagnostic.diagnostics && diagnostic.diagnostics.length > 0;
    
    const parsedDiagnostics = diagnostic.diagnostics ? JSON.parse(diagnostic.diagnostics) : [];
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}>
        <div className="bg-white p-6 rounded-lg w-3/4 relative max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <button className="absolute top-4 right-4 text-xl font-bold text-neutral-900" onClick={onClose}>
            X
          </button>
          <h2 className="font-bold text-xl">{diagnostic.titulo}</h2>
          <p>{convertTextToLinks(diagnostic.descripcion)}</p>
          {hasDetails ? (
            <div className="mt-4">
              {parsedDiagnostics.map((detail, idx) => (
                <div key={idx} className="mb-2">
                  {typeof detail === "object" && !Array.isArray(detail) ? (
                    <div className="overflow-x-auto mt-2">
                      <table className="min-w-full bg-white border border-gray-200 table-auto">
                        <thead>
                          <tr>
                            <th className="py-2 px-4 border-b text-neutral-800">Propiedad</th>
                            <th className="py-2 px-4 border-b text-neutral-800">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                            {Object.entries(detail).map(([key, value], subIdx) => (
                                <tr key={subIdx}>
                                <td className="py-2 px-4 border-b text-neutral-800">{key}</td>
                                <td className="py-2 px-4 border-b text-neutral-800">
                                    {typeof value === "object" ? (
                                    <pre className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap break-all">
                                        {JSON.stringify(value, null, 2)}
                                    </pre>
                                    ) : (
                                    value
                                    )}
                                </td>
                                </tr>
                            ))}
                            </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm">{detail}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay detalles adicionales disponibles</p>
          )}
        </div>
      </div>
    );
  };  
  
const DiagnosticsTable = () => {
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterStrategy, setFilterStrategy] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
  
    if (token) {
      axios.get("/api/performance-metric", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((response) => {
        setDiagnostics(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching diagnostics:", error.response);
        setLoading(false);
      });
    } else {
      console.error('Token no encontrado');
    }
  }, []);

  useEffect(() => {
    if (diagnostics && diagnostics.length > 0) {
      setData(diagnostics);
      setFilteredData(diagnostics);
    }
  }, [diagnostics]);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);

    let filtered = diagnostics;

    if (searchTerm === "mexico" || searchTerm === "mx") {
      filtered = diagnostics.filter(
        (item) => item.url === "https://utel.edu.mx/"
      );
    } else if (searchTerm) {
      filtered = diagnostics.filter((item) =>
        item.url.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredData(filtered);
  };
  
  const openModal = (diagnostic) => {
    setSelectedDiagnostic(diagnostic);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDiagnostic(null);
  };


  return (
    <div className="mt-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por URL..."
          value={search}
          onChange={handleSearch}
          className="px-4 py-2 border rounded-md w-full md:w-1/3"
        />
      </div>
  
      <div className="w-full overflow-x-auto">
  <table className="min-w-full bg-white border border-gray-200 table-auto">
    <thead>
      <tr>
        <th className="py-2 px-4 border-b text-neutral-800">#</th>
        <th className="py-2 px-4 border-b text-neutral-800">URL</th>
        <th className="py-2 px-4 border-b text-neutral-800">First Contentful Paint</th>
        <th className="py-2 px-4 border-b text-neutral-800">Largest Contentful Paint</th>
        <th className="py-2 px-4 border-b text-neutral-800">Total Blocking Time</th>
        <th className="py-2 px-4 border-b text-neutral-800">Cumulative Layout Shift</th>
        <th className="py-2 px-4 border-b text-neutral-800">Speed Index</th>
        <th className="py-2 px-4 border-b text-neutral-800">Estrategia</th>
        <th className="py-2 px-4 border-b text-neutral-800">Diagnóstico</th>
        <th className="py-2 px-4 border-b text-neutral-800">Fecha y Hora</th>
      </tr>
    </thead>
    <tbody>
      {filteredData.map((diagnostic, index) => (
        <tr key={index}>
          <td className="py-2 px-4 border-b text-neutral-800">{index + 1}</td>
          <td className="py-2 px-4 border-b text-neutral-800 max-w-[200px] truncate" title={diagnostic.url}>
            {diagnostic.url}
          </td>
          <td className="py-2 px-4 border-b text-neutral-800">{diagnostic.first_contentful_paint}</td>
          <td className="py-2 px-4 border-b text-neutral-800">{diagnostic.largest_contentful_paint}</td>
          <td className="py-2 px-4 border-b text-neutral-800">{diagnostic.total_blocking_time}</td>
          <td className="py-2 px-4 border-b text-neutral-800">{diagnostic.cumulative_layout_shift}</td>
          <td className="py-2 px-4 border-b text-neutral-800">{diagnostic.speed_index}</td>
          <td className="py-2 px-4 border-b text-neutral-800">{diagnostic.strategy}</td>
          <td className="py-2 px-4 border-b text-neutral-800 text-center">
            <button onClick={() => openModal(diagnostic)} className="text-blue-500 hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3C6.48 3 2 6.48 2 9C2 11.11 5.18 14.24 9.5 17.12C10.61 17.85 11.8 18.39 13.02 18.61C13.87 18.76 14.75 18.83 15.56 18.78C15.9 18.76 16.24 18.71 16.56 18.61C17.8 18.39 18.99 17.85 20.1 17.12C24.82 14.24 22 11.11 22 9C22 6.48 17.52 3 12 3ZM12 14C9.79 14 8 12.21 8 10C8 7.79 9.79 6 12 6C14.21 6 16 7.79 16 10C16 12.21 14.21 14 12 14Z" />
              </svg>
            </button>
          </td>
          <td className="py-2 px-4 border-b text-neutral-800">{new Date(diagnostic.created_at).toLocaleString()}</td>
        </tr>
      ))}
      {filteredData.length === 0 && (
        <tr>
          <td colSpan="10" className="py-2 px-4 text-center text-gray-500">
            No hay diagnósticos disponibles
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
      <DiagnosticModal isOpen={isModalOpen} onClose={closeModal} diagnostic={selectedDiagnostic} />
    </div>
  );  
};

export default DiagnosticsTable;
