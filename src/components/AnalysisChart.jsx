import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

//Grafica del Analysis.jsx
const getBarColor = (value) => {
    if (value < 50) {
        return 'rgba(255, 99, 132, 0.2)';
    } else if (value < 90) {
        return 'rgba(255, 159, 64, 0.2)';
    } else {
        return 'rgba(75, 192, 192, 0.2)';
    }
};

const getBorderColor = (value) => {
    if (value < 50) {
        return 'rgba(255, 99, 132, 1)';
    } else if (value < 90) {
        return 'rgba(255, 159, 64, 1)';
    } else {
        return 'rgba(75, 192, 192, 1)';
    }
};

const createChartData = (result) => ({
    labels: ['Accesibilidad', 'Mejores Prácticas', 'SEO', 'Rendimiento'],
    datasets: [{
        label: `${result.strategy.charAt(0).toUpperCase() + result.strategy.slice(1)} Resultados`,
        data: [
            parseFloat(result.accessibility_score) || 0,
            parseFloat(result.best_practices_score) || 0,
            parseFloat(result.seo_score) || 0,
            parseFloat(result.performance_score) || 0,
        ],
        backgroundColor: [
            getBarColor(result.accessibility_score),
            getBarColor(result.best_practices_score),
            getBarColor(result.seo_score),
            getBarColor(result.performance_score),
        ],
        borderColor: [
            getBorderColor(result.accessibility_score),
            getBorderColor(result.best_practices_score),
            getBorderColor(result.seo_score),
            getBorderColor(result.performance_score),
        ],
        borderWidth: 2,
    }],
});


const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'bottom',
        },
        tooltip: {
            callbacks: {
                label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`,
            },
        },
        datalabels: {
            display: true,
            anchor: 'end',
            align: 'end',
            color: '#FFFFFF',
            font: {
                weight: 'bold',
                size: 16,
            },
            formatter: (value) => `${value}`,
        },
    },
};

const AnalysisChart = ({ result }) => {
    const data = createChartData(result);

    return <Bar data={data} options={options} />;
};

export default AnalysisChart;
