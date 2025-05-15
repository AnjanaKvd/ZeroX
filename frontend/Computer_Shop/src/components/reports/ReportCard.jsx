import React from 'react';
import { ArrowDownTray, FileText, BarChart } from 'lucide-react';

/**
 * ReportCard component displays a report type with title, description, and actions
 */
const ReportCard = ({ 
  title,
  description,
  icon,
  onView,
  onExportPdf,
  onExportCsv,
  theme 
}) => {
  // Determine component colors based on theme
  const colors = theme === 'dark' 
    ? {
        bg: 'bg-gray-800',
        border: 'border-gray-700',
        title: 'text-white',
        text: 'text-gray-300',
        buttonPrimary: 'bg-blue-700 hover:bg-blue-800',
        buttonSecondary: 'bg-gray-700 hover:bg-gray-600'
      }
    : {
        bg: 'bg-white',
        border: 'border-gray-200',
        title: 'text-gray-800',
        text: 'text-gray-600',
        buttonPrimary: 'bg-blue-600 hover:bg-blue-700',
        buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
      };

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg shadow-sm overflow-hidden transition-all duration-200 h-full flex flex-col`}>
      <div className="p-5">
        <div className="flex items-center mb-4">
          <div className={`mr-4 p-2 rounded-full ${colors.buttonSecondary}`}>
            {icon === 'chart' && <BarChart className={colors.title} size={24} />}
            {icon === 'file' && <FileText className={colors.title} size={24} />}
          </div>
          <h3 className={`text-lg font-medium ${colors.title}`}>{title}</h3>
        </div>
        <p className={`${colors.text} mb-4`}>{description}</p>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onView}
            className={`flex items-center justify-center px-4 py-2 rounded text-white ${colors.buttonPrimary} transition-colors`}
          >
            <BarChart size={18} className="mr-2" />
            View Report
          </button>
          
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onExportPdf}
              className={`flex items-center justify-center px-3 py-2 rounded ${colors.buttonSecondary} transition-colors`}
              title="Export as PDF"
            >
              <ArrowDownTray size={16} className="mr-1" />
              PDF
            </button>
            
            <button
              onClick={onExportCsv}
              className={`flex items-center justify-center px-3 py-2 rounded ${colors.buttonSecondary} transition-colors`}
              title="Export as CSV"
            >
              <ArrowDownTray size={16} className="mr-1" />
              CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard; 