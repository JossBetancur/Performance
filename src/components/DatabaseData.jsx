import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';

const DatabaseData = ({ onClose }) => {
  //Page que muestra datos de la base de datos
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState('');
  const [noDataMessage, setNoDataMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStrategy, setFilterStrategy] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/get-analysis', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setData(response.data.data || []);
          setFilteredData(response.data.data || []);
          if (response.data.data.length === 0) {
            setNoDataMessage("No hay URLs asociadas con este usuario.");
          } else {
            setNoDataMessage('');
          }
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          setError('Error al obtener los datos: ' + error.message);
          console.error('Error al obtener los datos:', error);
        } else {
          setNoDataMessage("No hay URLs asociadas con este usuario.");
        }
      }
    };

    fetchData();
  }, []);

  const handleRowClick = (url) => {
    const matchingUrls = filteredData.filter(item => item.url.url === url);
    
    const averageData = matchingUrls.reduce((acc, item) => {
      acc.accessibility_score += item.accessibility_score || 0;
      acc.best_practices_score += item.best_practices_score || 0;
      acc.seo_score += item.seo_score || 0;
      acc.performance_score += item.performance_score || 0;
      acc.count += 1;
      return acc;
    }, {
      accessibility_score: 0,
      best_practices_score: 0,
      seo_score: 0,
      performance_score: 0,
      count: 0
    });

    const averages = {
      accessibility_score: (averageData.accessibility_score / averageData.count).toFixed(2),
      best_practices_score: (averageData.best_practices_score / averageData.count).toFixed(2),
      seo_score: (averageData.seo_score / averageData.count).toFixed(2),
      performance_score: (averageData.performance_score / averageData.count).toFixed(2),
    };

    const updatedSelectedUrl = {
      url: url,
      averages: averages,
      data: matchingUrls
    };
    
    setSelectedUrl(updatedSelectedUrl);
  
    navigate('/chart', { state: { selectedUrl: updatedSelectedUrl } });
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    applyFilters(e.target.value, filterDate);
  };

  const handleStrategyFilter = (strategy) => {
    const updatedFilterStrategy = filterStrategy.includes(strategy)
      ? filterStrategy.filter((item) => item !== strategy)
      : [...filterStrategy, strategy];

    setFilterStrategy(updatedFilterStrategy);
    applyFilters(search, filterDate, updatedFilterStrategy);
  };  

  const handleDateChange = (e) => {
    setFilterDate(e.target.value);
    applyFilters(search, e.target.value);
  };

  const applyFilters = (searchTerm, date, strategies = filterStrategy) => {
    let filtered = data;

    if (strategies.length > 0) {
      filtered = filtered.filter((item) =>
        item.strategy && strategies.includes(item.strategy)
      );
    }

    if (date) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.created_at).toISOString().slice(0, 10);
        return itemDate === date;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((item) => {
        const url = item.url?.url || '';
        if (searchTerm.toLowerCase() === 'mexico' || searchTerm.toLowerCase() === 'mx') {
          return url === 'https://utel.edu.mx/';
        }
        return url.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredData(filtered);
  };

  const sanitizedData = data.map(item => ({
    ...item,
    url: typeof item.url === 'string' ? item.url : ''
  }));
  

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map(item => ({
        URL: item.url?.url,
        Accesibilidad: item.accessibility_score,
        "Mejores Prácticas": item.best_practices_score,
        SEO: item.seo_score,
        Rendimiento: item.performance_score,
        Estrategia: item.strategy,
        Fecha: item.created_at.split('T')[0]
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, 'analisis_data.xlsx');
  };

  return (
    <div className="p-6">
      {noDataMessage && <p className="text-center text-gray-500">{noDataMessage}</p>}
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por URL..."
          value={search}
          onChange={handleSearch}
          className="px-4 py-2 border rounded-md w-full md:w-1/3"
        />
        <input
          type="date"
          value={filterDate}
          onChange={handleDateChange}
          className="px-4 py-2 border rounded-md"
        />

        <div className="relative">
          <button
            className="px-4 py-2 rounded-md bg-orange-700 text-white flex items-center gap-2 focus:outline-none hover:bg-orange-800"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            Estrategia
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          
          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
              <label className="flex items-center gap-2 px-4 py-2 text-neutral-900 hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={filterStrategy.includes('mobile')}
                  onChange={() => handleStrategyFilter('mobile')}
                  className="w-4 h-4  text-orange-600 rounded focus:ring-orange-500"
                />
                Mobile
              </label>
              <label className="flex items-center gap-2 px-4 py-2 text-neutral-900 hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={filterStrategy.includes('desktop')}
                  onChange={() => handleStrategyFilter('desktop')}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-700"
                />
                Desktop
              </label>
            </div>
          )}
        </div>
        <button
          onClick={handleDownload}
          disabled={filteredData.length === 0}
          className={`px-4 py-2 rounded-md text-white ${filteredData.length > 0 ? 'bg-orange-700 hover:bg-orange-800' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          Descargar Excel
        </button>
      </div>

      {filteredData.length > 0 ? (
        <div className="w-full overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-center">
              <th className="py-2 px-4 whitespace-nowrap">#</th>
              <th className="py-2 px-4 whitespace-nowrap">URL</th>
              <th className="py-2 px-4 whitespace-nowrap">Accesibilidad</th>
              <th className="py-2 px-4 whitespace-nowrap">M. Prácticas</th>
              <th className="py-2 px-4 whitespace-nowrap">SEO</th>
              <th className="py-2 px-4 whitespace-nowrap">Rendimiento</th>
              <th className="py-2 px-4 whitespace-nowrap">Tipo</th>
              <th className="py-2 px-4 whitespace-nowrap">Fecha y hora</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr
                key={index}
                className="text-center border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => handleRowClick(item.url.url)}
              >
                <td className="py-2 px-4 text-neutral-950">{index + 1}</td>
                <td className="py-2 px-4 text-neutral-950 max-w-[200px] truncate" title={item.url?.url}>
                  {item.url?.url}
                </td>
                <td className="py-2 px-4 text-neutral-950">{item.accessibility_score}</td>
                <td className="py-2 px-4 text-neutral-950">{item.best_practices_score}</td>
                <td className="py-2 px-4 text-neutral-950">{item.seo_score}</td>
                <td className="py-2 px-4 text-neutral-950">{item.performance_score}</td>
                <td className="py-2 px-4 text-neutral-950">{item.strategy}</td>
                <td className="py-2 px-4 text-neutral-950">{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>      
      ) : (
        !noDataMessage && <p className="text-center">No hay datos disponibles.</p>
      )}

    </div>
  );
};

export default DatabaseData;
