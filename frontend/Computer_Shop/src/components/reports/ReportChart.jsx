import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

/**
 * ReportChart component for visualizing report data
 */
const ReportChart = ({ 
  type = 'bar', 
  data = {}, 
  options = {},
  height = 300,
  theme 
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Set chart theme colors based on app theme
  const getThemeColors = () => {
    if (theme === 'dark') {
      return {
        textColor: '#e5e7eb',  // gray-200
        gridColor: '#4b5563',  // gray-600
        backgroundColor: '#1f2937' // gray-800
      };
    }
    return {
      textColor: '#1f2937',  // gray-800
      gridColor: '#e5e7eb',  // gray-200
      backgroundColor: '#ffffff' // white
    };
  };

  useEffect(() => {
    // If no chart data is provided, don't render
    if (!data.labels || !data.datasets) return;

    const themeColors = getThemeColors();
    
    // Apply theme to chart options
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: themeColors.textColor,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
          titleColor: theme === 'dark' ? '#e5e7eb' : '#1f2937',
          bodyColor: theme === 'dark' ? '#e5e7eb' : '#1f2937',
          borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            color: themeColors.gridColor,
            borderColor: themeColors.gridColor,
            display: false
          },
          ticks: {
            color: themeColors.textColor
          }
        },
        y: {
          grid: {
            color: themeColors.gridColor,
            borderColor: themeColors.gridColor
          },
          ticks: {
            color: themeColors.textColor,
            maxTicksLimit: 8
          }
        }
      },
      ...options
    };
    
    // Clean up any existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type,
      data,
      options: chartOptions
    });
    
    // Clean up chart on component unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, options, type, theme]);

  return (
    <div className={`relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
      {!data.labels || !data.datasets ? (
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No data available for chart visualization
          </p>
        </div>
      ) : (
        <div style={{ height: `${height}px` }}>
          <canvas ref={chartRef} />
        </div>
      )}
    </div>
  );
};

export default ReportChart; 