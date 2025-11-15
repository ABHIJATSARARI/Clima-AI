import React from 'react';
import type { ClimateRiskType } from '../types';
import { FloodIcon, HeatwaveIcon, DroughtIcon, WildfireIcon, ExclamationCircleIcon, CogIcon } from './icons/AppIcons';

interface PlaceholderMapProps {
    riskType: ClimateRiskType;
    isRateLimited: boolean;
    onGoToSettings: () => void;
}

const riskInfo: Record<ClimateRiskType, { icon: React.FC<React.SVGProps<SVGSVGElement>>; color: string; }> = {
    flood: { icon: FloodIcon, color: 'text-blue-500' },
    heatwave: { icon: HeatwaveIcon, color: 'text-orange-500' },
    drought: { icon: DroughtIcon, color: 'text-yellow-600' },
    wildfire: { icon: WildfireIcon, color: 'text-red-500' },
};

const PlaceholderMap: React.FC<PlaceholderMapProps> = ({ riskType, isRateLimited, onGoToSettings }) => {
    const { icon: Icon, color } = riskInfo[riskType];
    
    const title = isRateLimited ? "Image Generation Paused" : "AI Simulation Unavailable";
    const message = isRateLimited
        ? "Daily usage limits may have been reached. Your text report is still generating."
        : "The AI model is busy, but your report is still generating below.";

    return (
        <div className="w-full aspect-video md:aspect-[2/1] bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-center p-4 transition-all duration-300">
            <Icon className={`w-16 h-16 ${color} opacity-40 mb-4`} />
            <h4 className="text-lg font-bold text-slate-700">{title}</h4>
            <div className="mt-2 inline-flex items-center text-xs text-yellow-900 bg-yellow-100 px-3 py-1.5 rounded-full border border-yellow-300">
                 <ExclamationCircleIcon className="w-4 h-4 mr-2 text-yellow-600"/>
                 <p>{message}</p>
            </div>
            {isRateLimited && (
                <button 
                    onClick={onGoToSettings}
                    className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg transition-colors"
                >
                    <CogIcon className="w-5 h-5" />
                    Go to Settings to Reset
                </button>
            )}
        </div>
    );
};

export default PlaceholderMap;