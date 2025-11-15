import React from 'react';

const HistoricalDataSection: React.FC = () => {
    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Historical Data &amp; Trends</h3>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center">
                <p className="text-gray-600 mb-4">
                    Historical climate data and trend analysis for this region will be available here soon.
                </p>
                <div className="mt-4 opacity-40">
                    <svg className="w-full h-40 text-gray-300 inline-block" fill="currentColor" viewBox="0 0 100 50" preserveAspectRatio="none">
                        <rect width="12" height="30" x="10" y="20" rx="2"></rect>
                        <rect width="12" height="40" x="30" y="10" rx="2"></rect>
                        <rect width="12" height="25" x="50" y="25" rx="2"></rect>
                        <rect width="12" height="45" x="70" y="5" rx="2"></rect>
                        <line x1="0" y1="50" x2="100" y2="50" stroke="gray" strokeWidth="0.5"></line>
                    </svg>
                 </div>
                <p className="text-xs text-gray-500 mt-2">Understanding historical patterns is key to preparing for future climate challenges.</p>
                 <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200 italic">
                    Data shown is for demonstration purposes (mock data). Future data will be sourced from NOAA & local meteorological services.
                </p>
            </div>
        </div>
    );
};

export default HistoricalDataSection;