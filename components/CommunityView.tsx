import React, { useState } from 'react';
import type { Location, ComparisonData, ClimateRiskType } from '../types';
import * as geminiService from '../services/geminiService';
import Spinner from './Spinner';
import { FloodIcon, HeatwaveIcon, DroughtIcon, WildfireIcon } from './icons/AppIcons';

interface CommunityViewProps {
    myLocation: Location;
}

const RiskMeter: React.FC<{ score: number }> = ({ score }) => {
    const percentage = (score / 10) * 100;
    let bgColor = 'bg-green-500 dark:bg-green-400';
    if (score > 4) bgColor = 'bg-yellow-500 dark:bg-yellow-400';
    if (score > 7) bgColor = 'bg-red-500 dark:bg-red-400';

    return (
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 relative overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${bgColor}`}
                style={{ width: `${percentage}%` }}
                role="meter"
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={10}
            ></div>
             <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                {score}/10
            </span>
        </div>
    );
};

const ComparisonRow: React.FC<{ 
    risk: ClimateRiskType; 
    myScore: number; 
    otherScore: number; 
}> = ({ risk, myScore, otherScore }) => {
    
    const iconMap: Record<ClimateRiskType, React.ReactElement> = {
        flood: <FloodIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
        heatwave: <HeatwaveIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
        drought: <DroughtIcon className="w-6 h-6 text-yellow-700 dark:text-yellow-400" />,
        wildfire: <WildfireIcon className="w-6 h-6 text-red-600 dark:text-red-400" />,
    };

    return (
        <div className="grid grid-cols-3 items-center gap-4 py-3">
            <div className="flex items-center gap-2">
                {iconMap[risk]}
                <span className="font-semibold capitalize text-gray-700 dark:text-slate-200">{risk}</span>
            </div>
            <RiskMeter score={myScore} />
            <RiskMeter score={otherScore} />
        </div>
    );
};


const CommunityView: React.FC<CommunityViewProps> = ({ myLocation }) => {
    const [otherLocation, setOtherLocation] = useState('');
    const [comparisonResult, setComparisonResult] = useState<ComparisonData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCompare = async () => {
        if (!otherLocation.trim()) return;
        setIsLoading(true);
        setComparisonResult(null);
        setError(null);
        try {
            const result = await geminiService.generateCommunityComparison(myLocation, otherLocation);
            setComparisonResult(result);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Sorry, an error occurred while generating the comparison.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 mb-2">Community Comparison</h2>
            <p className="text-gray-600 dark:text-slate-300 mb-6">Visually compare your local climate risks with another city or region.</p>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={otherLocation}
                        onChange={(e) => setOtherLocation(e.target.value)}
                        placeholder="Enter a city, e.g., 'Phoenix, Arizona'"
                        className="flex-grow p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition bg-transparent dark:text-slate-100"
                    />
                    <button
                        onClick={handleCompare}
                        disabled={isLoading || !otherLocation.trim()}
                        className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition flex items-center justify-center"
                    >
                        {isLoading ? <Spinner /> : 'Compare Risks'}
                    </button>
                </div>
            </div>
            
            {error && (
                 <div className="mt-6 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
                    <p className="font-bold">Comparison Failed</p>
                    <p>{error}</p>
                </div>
            )}

            {isLoading && !comparisonResult && (
                <div className="mt-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50 animate-pulse">
                    <div className="w-1/2 h-6 bg-slate-200 dark:bg-slate-700 rounded-md mb-4"></div>
                     <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                    </div>
                     {[...Array(4)].map((_, i) => (
                        <div key={i} className="grid grid-cols-3 gap-4 mt-3">
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                        </div>
                    ))}
                </div>
            )}

            {comparisonResult && (
                <div className="mt-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50 animate-fade-in">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4">Risk Profile Comparison</h3>
                    
                    {/* Headers */}
                    <div className="grid grid-cols-3 items-center gap-4 pb-2 border-b-2 border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-gray-600 dark:text-slate-300 text-sm">Risk Type</span>
                        <span className="font-bold text-gray-600 dark:text-slate-300 text-sm">{myLocation.displayName}</span>
                        <span className="font-bold text-gray-600 dark:text-slate-300 text-sm">{otherLocation}</span>
                    </div>

                    {/* Data Rows */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                         {comparisonResult.comparison.map(item => (
                            <ComparisonRow 
                                key={item.riskType}
                                risk={item.riskType}
                                myScore={item.myLocationScore}
                                otherScore={item.otherLocationScore}
                            />
                        ))}
                    </div>
                    
                    {/* Summary */}
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-gray-800 dark:text-slate-100 mb-2">AI Summary</h4>
                        <p className="text-sm text-gray-700 dark:text-slate-300">{comparisonResult.summary}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityView;