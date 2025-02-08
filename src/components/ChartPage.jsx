import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import ChartAnnotation from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartAnnotation, ChartDataLabels);

const ChartPage = () => {
  //page de graficas X URL
  const location = useLocation();
  const { selectedUrl } = location.state || {};
  const [platform, setPlatform] = useState('desktop');
  const [chartData, setChartData] = useState({
    labels: ['Accesibilidad', 'Mejores Prácticas', 'SEO', 'Rendimiento'],
    datasets: [
      {
        label: 'Puntuación Promedio',
        data: [],
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
    options: {},
  });

  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [trendChartData, setTrendChartData] = useState({
    labels: [],
    datasets: [
      { label: 'Rendimiento', data: [], borderColor: 'rgba(75, 192, 192, 1)', fill: false },
      { label: 'SEO', data: [], borderColor: 'rgba(54, 162, 235, 1)', fill: false },
      { label: 'Mejores Prácticas', data: [], borderColor: 'rgba(255, 206, 86, 1)', fill: false },
      { label: 'Accesibilidad', data: [], borderColor: 'rgba(255, 99, 132, 1)', fill: false },
    ],
  });

  const calculateAverages = (data) => {
    const scores = {
      accessibility_score: 0,
      best_practices_score: 0,
      seo_score: 0,
      performance_score: 0,
    };

    data.forEach((entry) => {
      scores.accessibility_score += entry.accessibility_score || 0;
      scores.best_practices_score += entry.best_practices_score || 0;
      scores.seo_score += entry.seo_score || 0;
      scores.performance_score += entry.performance_score || 0;
    });

    const totalEntries = data.length;

    return {
      accessibility_score: scores.accessibility_score / totalEntries,
      best_practices_score: scores.best_practices_score / totalEntries,
      seo_score: scores.seo_score / totalEntries,
      performance_score: scores.performance_score / totalEntries,
    };
  };

  const getScoresForPlatform = (platform) => {
    const data = selectedUrl?.data || [];
    if (platform === 'mobile') {
      return data.filter((entry) => entry.strategy === 'mobile');
    } else {
      return data.filter((entry) => entry.strategy === 'desktop');
    }
  };

  const filterDataByDate = (data) => {
    const { start, end } = dateFilter;
    if (!start || !end) return data;
    return data.filter((entry) => {
      const entryDate = new Date(entry.created_at);
      return entryDate >= new Date(start) && entryDate <= new Date(end);
    });
  };

  const generateDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    while (start <= end) {
      dates.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    return dates;
  };
  
  const getDataForDate = (date, filteredData) => {
    const entry = filteredData.find(entry => new Date(entry.created_at).toLocaleDateString() === date.toLocaleDateString());
    return entry || { performance_score: null, seo_score: null, best_practices_score: null, accessibility_score: null };
  };
  
  useEffect(() => {
    if (selectedUrl?.data?.length) {
      const scoresForPlatform = getScoresForPlatform(platform);
      const filteredData = filterDataByDate(scoresForPlatform);
      const averages = calculateAverages(filteredData);
  
      setChartData({
        labels: ['Accesibilidad', 'Mejores Prácticas', 'SEO', 'Rendimiento'],
        datasets: [
          {
            label: `Puntuación Promedio (${platform.charAt(0).toUpperCase() + platform.slice(1)})`,
            data: [
              averages.accessibility_score,
              averages.best_practices_score,
              averages.seo_score,
              averages.performance_score,
            ],
            fill: false,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0,
            borderWidth: 1,
          },
        ],
        options: {
          responsive: true,
          plugins: {
            datalabels: {
              color: 'white',
              anchor: 'end',
              align: 'top',
              font: {
                size: 30,
                weight: 'bold',
              },
              formatter: (value) => value ? value.toFixed(2) : '',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: 'white',
                font: {
                  size: 20,
                  weight: 'bold',
                },
              },
            },
            x: {
              ticks: {
                color: 'white',
                font: {
                  size: 20,
                  weight: 'bold',
                },
              },
            },
          },
          
          elements: {
            line: {
              borderWidth: 2,
            },
            point: {
              radius: 4,
              backgroundColor: 'rgba(75, 192, 192, 1)',
            },
          },
        },
      });
  
      const dateRange = generateDateRange(dateFilter.start, dateFilter.end);
      const trendData = {
        labels: dateRange.map(date => date.toLocaleDateString()),
        datasets: [
          {
            label: 'Rendimiento',
            data: dateRange.map(date => getDataForDate(date, filteredData).performance_score),
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false,
            borderWidth: 2,
            tension: 0,
            spanGaps: true,
          },
          {
            label: 'SEO',
            data: dateRange.map(date => getDataForDate(date, filteredData).seo_score),
            borderColor: 'rgba(54, 162, 235, 1)',
            fill: false,
            borderWidth: 2,
            tension: 0,
            spanGaps: true,
          },
          {
            label: 'Mejores Prácticas',
            data: dateRange.map(date => getDataForDate(date, filteredData).best_practices_score),
            borderColor: 'rgba(255, 206, 86, 1)',
            fill: false,
            borderWidth: 2,
            tension: 0,
            spanGaps: true,
          },
          {
            label: 'Accesibilidad',
            data: dateRange.map(date => getDataForDate(date, filteredData).accessibility_score),
            borderColor: 'rgba(255, 99, 132, 1)',
            fill: false,
            borderWidth: 2,
            tension: 0,
            spanGaps: true,
          },
        ],
      };
  
      setTrendChartData(trendData);
    }
  }, [selectedUrl, platform, dateFilter]);  

  return (
    <div className="pt-0">
      <h2 className="text-center text-2xl mb-4 text-white">Grafica de la URL ~  {selectedUrl?.url}</h2>

      <div className="mb-4 flex justify-center">
        <button
          onClick={() => setPlatform('desktop')}
          className={`px-4 py-2 mr-2 rounded ${platform === 'desktop' ? 'bg-[#228b9b] text-white' : 'bg-gray-800 text-white'}`}
        >
          Desktop
        </button>
        <button
          onClick={() => setPlatform('mobile')}
          className={`px-4 py-2 rounded ${platform === 'mobile' ? 'bg-[#228b9b] text-white' : 'bg-gray-800 text-white'}`}
        >
          Mobile
        </button>
      </div>

      <div className="flex justify-center mb-4 mt-16">

      <div className="w-1/2 px-2">
        <div className="mb-4 flex justify-center gap-4">
          <div className="mb-4">
            <label className="text-white mr-2">Desde:</label>
            <input
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
              className="p-2 bg-orange-700 rounded hover:bg-orange-800"
            />
          </div>
          <div className="mb-4">
            <label className="text-white mr-2">Hasta:</label>
            <input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
              className="p-2 bg-orange-700 rounded hover:bg-orange-800"
            />
          </div>
          </div>

          <Line data={trendChartData} />
        </div>

        <div className="w-1/2 px-2 pt-2">
          <h2 className="text-center text-white">Promedio ~ {selectedUrl?.url}</h2>
          <Line data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default ChartPage;
