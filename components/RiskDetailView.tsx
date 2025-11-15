import React, { useState, useEffect } from 'react';
import type { ClimateRiskType, RiskData, Location, ActionItemStatus, ActiveView } from '../types';
import ActionPlan from './ActionPlan';
import Spinner from './Spinner';
import { ArrowLeftIcon, ExclamationTriangleIcon, ShareIcon } from './icons/AppIcons';
import HistoricalChart from './HistoricalChart';
import PreparednessGuide from './PreparednessGuide';
import WeatherForecast from './WeatherForecast';
import GenerationAnimator from './GenerationAnimator';
import * as geminiService from '../services/geminiService';
import FutureProjectionChart from './FutureProjectionChart';


interface RiskDetailViewProps {
    riskType: ClimateRiskType;
    data: Partial<RiskData> | null;
    isLoading: boolean;
    onBack: () => void;
    location: Location;
    planApiError: string | null;
    projectionApiError: string | null;
    onUpdateStatus: (risk: ClimateRiskType, itemTitle: string, status: ActionItemStatus) => void;
}

const riskTitles: Record<ClimateRiskType, string> = {
    flood: 'Flood Risk Analysis',
    heatwave: 'Extreme Heat Analysis',
    drought: 'Drought Stress Analysis',
    wildfire: 'Wildfire Danger Analysis',
};

const SectionCard: React.FC<{ title: string; children: React.ReactNode, className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50 ${className}`}>
        <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4">{title}</h3>
        {children}
    </div>
);


const RiskDetailView: React.FC<RiskDetailViewProps> = ({ riskType, data, isLoading, onBack, location, planApiError, projectionApiError, onUpdateStatus }) => {
    const title = riskTitles[riskType];
    
    const [showPreparednessGuide, setShowPreparednessGuide] = useState(false);
    
    const [isSharing, setIsSharing] = useState(false);
    const [shareToast, setShareToast] = useState('');

    useEffect(() => {
        if (shareToast) {
            const timer = setTimeout(() => setShareToast(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [shareToast]);
    
    const handleShare = async () => {
        if (!data || isSharing) return;

        setIsSharing(true);
        try {
            const summary = await geminiService.generateShareableSummary(location, riskType, data);
            
            if (navigator.share) {
                await navigator.share({
                    title: `CLIMA Report: ${riskType} risk in ${location.displayName}`,
                    text: summary,
                });
            } else {
                await navigator.clipboard.writeText(summary);
                setShareToast('Report summary copied to clipboard!');
            }
        } catch (error) {
            console.error("Sharing failed:", error);
            setShareToast('Could not create shareable summary.');
        } finally {
            setIsSharing(false);
        }
    };

    const highPriorityActions = data?.actionPlan?.items.filter(item => item.priority === 'High') ?? [];
    const isReportComplete = data?.actionPlan && data.futureProjection;

    const renderHistoricalData = () => {
        if (!data?.historicalData) {
            return (
                <div className="w-full h-56 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <Spinner />
                    <p className="ml-4 text-slate-600 dark:text-slate-300">Loading historical data...</p>
                </div>
            );
        }

        return (
            <HistoricalChart 
                data={data.historicalData.data} 
                riskType={riskType}
                label={data.historicalData.label}
                unit={data.historicalData.unit}
            />
        );
    };
    
    return (
        <div className="animate-fade-in space-y-6 relative">
            {/* Share Toast */}
            {shareToast && (
                 <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
                    {shareToast}
                </div>
            )}

            <div className="flex justify-between items-start">
                 <div>
                    <button onClick={onBack} className="flex items-center text-green-600 dark:text-green-400 font-semibold mb-2 hover:text-green-800 dark:hover:text-green-300 transition-colors group">
                        <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Dashboard
                    </button>
                    <h2 className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 tracking-tight capitalize">{title}</h2>
                </div>
                {isReportComplete && (
                     <button 
                        onClick={handleShare}
                        disabled={isSharing}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isSharing ? <Spinner /> : <ShareIcon className="h-5 w-5" />}
                        <span>Share</span>
                    </button>
                )}
            </div>
            
            <SectionCard title="Historical Climate Trends">
                {renderHistoricalData()}
            </SectionCard>

            <SectionCard title="AI-Powered Future Projections">
                 {projectionApiError && !data?.futureProjection ? (
                    <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
                        <p className="font-bold">Could Not Generate Future Projection</p>
                        <p>{projectionApiError}</p>
                    </div>
                ) : !data?.futureProjection ? (
                    <GenerationAnimator text="Forecasting long-term trends..." />
                ) : (
                    <FutureProjectionChart
                        historicalData={data.historicalData!}
                        projectionData={data.futureProjection}
                        riskType={riskType}
                    />
                )}
            </SectionCard>

            <SectionCard title="Personalized Action Plan">
                {planApiError && !data?.actionPlan ? (
                    <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
                        <p className="font-bold">Could Not Generate Action Plan</p>
                        <p>{planApiError}</p>
                    </div>
                ) : !data?.actionPlan ? (
                     <GenerationAnimator text="Compiling personalized action plan..." />
                ) : (
                     <ActionPlan 
                        plan={data.actionPlan}
                        onUpdateStatus={(itemTitle, status) => onUpdateStatus(riskType, itemTitle, status)}
                     />
                )}
            </SectionCard>
            
            <SectionCard title="5-Day Weather Forecast">
                <WeatherForecast location={location} />
            </SectionCard>

            {!isLoading && highPriorityActions.length > 0 && (
                <div className="mt-8 text-center pb-4">
                    <button
                        onClick={() => setShowPreparednessGuide(true)}
                        className="bg-amber-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-amber-600 transition-all transform hover:scale-105 flex items-center justify-center mx-auto"
                        aria-label="Show immediate preparedness guide"
                    >
                        <ExclamationTriangleIcon className="h-6 w-6 mr-3" />
                        Get Prepared Now
                    </button>
                </div>
            )}

            {showPreparednessGuide && (
                <PreparednessGuide
                    items={highPriorityActions}
                    onClose={() => setShowPreparednessGuide(false)}
                />
            )}
        </div>
    );
};

export default RiskDetailView;