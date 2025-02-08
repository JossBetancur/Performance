import React, { useState } from 'react';
import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios, { all } from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useAnalysis } from "../context/AnalysisContext";
import AnalysisChart from './AnalysisChart';
import { Spinner } from 'react-bootstrap';
import DiagnosticsDropdown from './DiagnosticsDropdown';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analysis = () => {
  //Pagina de Analisis de las URL
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState('');
  const [mobileData, setMobileData] = useState([]);
  const [desktopData, setDesktopData] = useState([]);
  const [includeCMS, setIncludeCMS] = useState(false);
  const [includeLPS, setIncludeLPS] = useState(false);
  const [activeTab, setActiveTab] = useState('mobile');
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { analysisState, startAnalysis, updateProgress} = useAnalysis();
  const [abortController, setAbortController] = useState(null);
  const { analysisResults, saveResults } = useAnalysis();
  const [results, setResults] = useState(() => {
    const savedResults = JSON.parse(localStorage.getItem('analysisResults'));
    return savedResults || [];
  });
  const [isFixed, setIsFixed] = useState(false);
  const [selectedUrl, setSelectedUrl] = React.useState("");

  
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      const triggerPoint = 400;

      if (offset > triggerPoint) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { 
    localStorage.setItem('analysisResults', JSON.stringify(results)); 
  }, [results]);
  
  useEffect(() => {
    const savedResult = localStorage.getItem('analysisResult');
    if (savedResult) {
      setResults(JSON.parse(savedResult));
    }
  }, []);

  const divideIntoBatches = (array, batchSize) => {

    const batches = [];

    for (let i = 0; i < array.length; i += batchSize) {
      const batch = array.slice(i, i + batchSize);
      batches.push(batch);
    }

    return batches;
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const savePerformanceMetrics = async (url, metrics, diagnostics, strategy) => {
    try {
      const response = await axios.post(
        '/api/performance-metrics',
        {
          url: url,
          first_contentful_paint: metrics.firstContentfulPaint,
          largest_contentful_paint: metrics.largestContentfulPaint,
          total_blocking_time: metrics.totalBlockingTime,
          cumulative_layout_shift: metrics.cumulativeLayoutShift,
          speed_index: metrics.speedIndex,
          diagnostics: diagnostics,
          strategy: strategy,
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

    } catch (error) {
      console.error('Error al guardar métricas de rendimiento:', error);
    }
  };
  

  const processUrlsInBatches = async (urls, batchSize, strategy, signal) => {

    const allResults = [];
    const batches = divideIntoBatches(urls, batchSize);
    const uniqueMetricsMap = new Map();
    const totalUrls = urls.length;
  
    for (const batch of batches) {

      const batchResults = await Promise.all(
        batch.map(async (urlObject) => {
          const url = urlObject.url; 

          const controller = new AbortController();
          setAbortController(controller); 

          const { signal } = controller; 
  
          const response = await axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=AIzaSyCDLdWkZ2UWQI1Qk4KACLJWdZAA1Q6Dkto&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO&category=PERFORMANCE&strategy=${strategy}`, { signal });

          const scores = {
            url,
            accessibility_score: (response.data.lighthouseResult.categories.accessibility?.score * 100 || 0).toFixed(2),
            best_practices_score: (response.data.lighthouseResult.categories['best-practices']?.score * 100 || 0).toFixed(2),
            seo_score: (response.data.lighthouseResult.categories.seo?.score * 100 || 0).toFixed(2),
            performance_score: (response.data.lighthouseResult.categories.performance?.score * 100 || 0).toFixed(2),
            strategy,
          };
  
          const performanceAudits = response.data.lighthouseResult.categories.performance.auditRefs.map(auditRef => auditRef.id);

          const audits = response.data.lighthouseResult.audits;

          const metrics = {
            firstContentfulPaint: audits['first-contentful-paint']?.displayValue || 'N/A',
            largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 'N/A',
            totalBlockingTime: audits['total-blocking-time']?.displayValue || 'N/A',
            cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || 'N/A',
            speedIndex: audits['speed-index']?.displayValue || 'N/A',
          };

          const diagnostics = Object.entries(response.data.lighthouseResult.audits || {})
            .filter(([key, audit]) => 
              audit.score !== 1 && 
              performanceAudits.includes(key) && 
              audit.details && Object.keys(audit.details).length > 0
            )
            .map(([key, audit]) => ({
              titulo: audit.title || 'Sin título',
              descripcion: audit.description || 'Sin descripción detallada. Verifique el análisis para más detalles.',
              detalles: audit.details?.items || [],
              sugerencias: audit.suggestedImprovements || 'No se han sugerido mejoras. Consulte la documentación de Lighthouse para detalles.',
              archivo: audit.details?.filePath || 'No disponible',
            }));

          return { ...scores, diagnostics, metrics };

        })
        
      );

      allResults.push(...batchResults);
  
      const progressCount = allResults.length;
      updateProgress(progressCount);
      await delay(1000);
    }
    return allResults;

  };

 

  const handleAnalyzeClick = async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    setLoading(true);
    setIsAnalyzing(true);
    setProgress(0);

    try {
        const [cmsResponse, lpsResponse] = await Promise.all([
            axios.get('/api/url/cms', { signal }),
            axios.get('/api/url/lps', { signal })
        ]);

        const cmsUrls = cmsResponse.data.map(item => item.url);
        const lpsUrls = lpsResponse.data.map(item => item.url);

        const urlsFromInput = urls
            .split('\n')
            .map((url) => url.trim())
            .filter((url) => url.length > 0);

        const urlsToAnalyze = [
            ...urlsFromInput.map(url => ({ url })),
            ...(includeCMS ? cmsUrls.map(url => ({ url })) : []),
            ...(includeLPS ? lpsUrls.map(url => ({ url })) : []),
        ];

        if (urlsToAnalyze.length === 0) {
            toast.warning('No hay URLs para analizar.');
            setLoading(false);
            setIsAnalyzing(false);
            return;
        }

        const totalUrls = urlsToAnalyze.length * 2;
        startAnalysis(totalUrls);

        const mobileResults = await processUrlsInBatches(urlsToAnalyze, 10, 'mobile', signal);
        updateProgress(mobileResults.length);

        const desktopResults = await processUrlsInBatches(urlsToAnalyze, 10, 'desktop', signal);
        updateProgress(mobileResults.length + desktopResults.length);

        const allResults = [...mobileResults, ...desktopResults];

        const token = localStorage.getItem('token');
        await axios.post(
            '/api/save-analysis',
            { data: allResults },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                signal,
            }
        );

         for (let result of allResults) {
          await savePerformanceMetrics(result.url, result.metrics, result.diagnostics, result.strategy); // Aquí pasas `result.strategy` (que ya está en el resultado)
      }

        setResults(allResults);
        localStorage.setItem('analysisResults', JSON.stringify(allResults));

        setMobileData(mobileResults);
        setDesktopData(desktopResults);
        setLoading(false);
        setIsAnalyzing(false);
        toast.success('Análisis completado');
    } catch (error) {
        setLoading(false);
        setIsAnalyzing(false);
        toast.error('Error en el análisis');
        updateProgress(0);
    }

    return () => {
        controller.abort();
    };
};

  

  const onTabClick = (tab) => {
    setActiveTab(tab);
  };

  const onShowDatabaseData = () => {
    navigate('/database-data');
  };

  const onShowMetrics = () => {
    navigate('/performance-metrics')
  }

  const filteredData = activeTab === 'mobile' ? mobileData : desktopData;
  
  return (
    <div className="max-w-6xl mx-auto p-4 rounded shadow-md">
      <h1 className="max-w-2xl mx-auto text-2xl sm:text-4xl lg:text-6xl text-center tracking-wide mb-6">Analizador de Utel Performance</h1>

    <div className="flex max-w-4xl mx-auto p-4">

      <textarea
          className="flex-grow h-20 border border-gray-300 p-2 rounded mr-2 overflow-auto bg-gray-500 text-white resize-none"
          value={urls}
          onChange={(e) => {
            const inputValue = e.target.value;

            const cleanedInput = inputValue
              .split('\n')
              .map((line) => line.trim())
              .join('\n');

            setUrls(cleanedInput);
          }}
          placeholder="Escribe una URL por línea (ejemplo: https://exampleUrl.com)"
          aria-label="Caja de texto para ingresar URLs separadas por línea"
        />

        <button
          type="button"
          disabled={loading}
          onClick={handleAnalyzeClick}
          className={`bg-[#228b9b] text-white p-2 rounded ${loading ? 'opacity-50 cursor-not-allowed tracking-wide' : 'hover:bg-[#1d5f69] tracking-wide'}`}
        >
          {loading ? 'Verificando...' : 'Analizar URLs'}
        </button>

    </div>

      <div className="flex mb-2 max-w-2xl mx-auto pl-4 pb-4">

        <label className="mr-4">
          <input 
            type="checkbox" 
            className='mr-1' 
            checked={includeCMS} 
            onChange={(e) => setIncludeCMS(e.target.checked)} 
          />
          CMS
        </label>

        <label>
          <input 
            type="checkbox" 
            className='mr-1' 
            checked={includeLPS} 
            onChange={(e) => setIncludeLPS(e.target.checked)} 
          />
          LPS
        </label>

      </div>
          <div
            className={`container-change mb-4 flex flex-wrap justify-center sm:justify-around items-center gap-4 pt-2 pb-2 w-full px-4 sm:px-[12rem] ${
              isFixed ? 'fixed top-16 left-0 right-0 z-10 bg-[#121212]' : ''
            }`}
          >
            <div
              className={`mobile cursor-pointer text-center p-4 rounded-lg transition duration-300 ${
                activeTab === 'mobile' ? 'bg-[#228b9b] text-white' : 'bg-gray-800'
              }`}
              onClick={() => onTabClick('mobile')}
            >
              <i className="fa-solid fa-mobile fa-2x"></i>
              <p>Móvil</p>
            </div>

            <div
              className={`pc cursor-pointer text-center p-4 rounded-lg transition duration-300 ${
                activeTab === 'desktop' ? 'bg-[#228b9b] text-white' : 'bg-gray-800'
              }`}
              onClick={() => onTabClick('desktop')}
            >
              <i className="fa-solid fa-desktop fa-2x"></i>
              <p>Escritorio</p>
            </div>

            <button
              onClick={onShowDatabaseData}
              className="bg-orange-700 text-white p-4 rounded hover:bg-orange-800 transition duration-300"
            >
              Datos Guardados
            </button>

            <button
              onClick={onShowMetrics}
              className="bg-orange-700 text-white p-4 rounded hover:bg-orange-800 transition duration-300"
            >
              Historial de métricas
            </button>
          </div>


      {filteredData.length > 0 && filteredData.map((result, index) => (
        <div key={index} className="chart-container mb-4 max-w-4xl mx-auto">
          <h3 className='flex justify-center mt-20' >URL: {result.url} ~ {result.strategy}</h3>


          <div className="flex justify-around my-4 mt-10">

            <div className="text-center">
              <p className="font-bold">Accessibility</p>
            </div>

            <div className="text-center">
              <p className="font-bold">Best Practices</p>
            </div>

            <div className="text-center">
              <p className="font-bold">SEO</p>
            </div>

            <div className="text-center">
              <p className="font-bold">Performance</p>
            </div>

          </div>

          <div>

            <AnalysisChart result={result} />

            <div className="text-center overflow-x-auto mt-8">
              <span className="pl-4">Métricas : {result.url}</span>
              {result.metrics ? (
                <table className="min-w-full">
                  <tbody>
                    <tr key={index}>
                      <td className="py-2 px-4 text-neutral-100 text-center">
                        <div className="flex flex-col mt-10">
                          <hr />
                          <div className="font-semibold pt-3">First Contentful Paint</div>
                          <div className="pb-5">{result.metrics.firstContentfulPaint || "N/A"}</div>

                          <hr />
                          <div className="font-semibold pt-3">Total Blocking Time</div>
                          <div className="pb-5">{result.metrics.totalBlockingTime || "N/A"}</div>

                          <hr />
                          <div className="font-semibold pt-3">Speed Index</div>
                          <div className="pb-5">{result.metrics.speedIndex || "N/A"}</div>
                        </div>
                      </td>

                      <td className="px-4 text-neutral-100 text-center">
                        <div className="flex flex-col">
                          <hr />
                          <div className="font-semibold pt-3">Renderizado del <br /> mayor elemento con contenido</div>
                          <div className="pb-5">{result.metrics.largestContentfulPaint || "N/A"}</div>

                          <hr />
                          <div className="font-semibold pt-3">Cambios de diseño acumulados</div>
                          <div className="pb-5">{result.metrics.cumulativeLayoutShift || "N/A"}</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-gray-500">No hay detalles adicionales disponibles</p>
              )}
            </div>

              <div>

              <div className="mt-4">
                {filteredData.length > 0 ? (
                  <DiagnosticsDropdown title="Diagnostico " diagnostics={result.diagnostics} />
                ) : (
                  <p className="text-center text-gray-500">No hay datos disponibles para mostrar.</p>
                )}
              </div>
              </div>
            </div>
          </div>
        
      ))} 

      <ToastContainer />

    </div>
  );
};

export default Analysis;
