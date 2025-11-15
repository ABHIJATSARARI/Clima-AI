import React, { useState, useRef } from 'react';
import type { ClimateRiskType } from '../types';

interface ChartDataPoint {
    year: string;
    value: number; // This will now always be an anomaly value
}

interface HistoricalChartProps {
    data: ChartDataPoint[];
    riskType: ClimateRiskType;
    label: string;
    unit: string;
}

const riskTextColors: Record<ClimateRiskType, string> = {
    flood: 'text-blue-800 dark:text-blue-300',
    heatwave: 'text-orange-800 dark:text-orange-300',
    drought: 'text-amber-800 dark:text-amber-300',
    wildfire: 'text-red-800 dark:text-red-300',
};

interface TooltipState {
    visible: boolean;
    content: string;
    x: number;
    y: number;
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ data, riskType, label, unit }) => {
    const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, content: '', x: 0, y: 0 });
    const chartRef = useRef<HTMLDivElement>(null);

    const handleShowTooltip = (event: React.MouseEvent<HTMLDivElement> | React.FocusEvent<HTMLDivElement>, content: string) => {
        if (!chartRef.current) return;
        const chartRect = chartRef.current.getBoundingClientRect();
        const elRect = event.currentTarget.getBoundingClientRect();
        
        const x = elRect.left + elRect.width / 2 - chartRect.left;
        const y = elRect.top - chartRect.top;

        setTooltip({ visible: true, content, x, y });
    };

    const handleHideTooltip = () => {
        setTooltip(prev => ({ ...prev, visible: false }));
    };

    if (!data || data.length === 0) {
        return (
            <div className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-center text-slate-600 dark:text-slate-300">
                No historical data available for this location.
            </div>
        );
    }

    const isDrought = riskType === 'drought';
    const getBarColor = (value: number) => {
        const isPositive = value >= 0;
        if (isDrought) {
            // For drought (precipitation anomaly), positive is good (wetter), negative is bad (drier)
            return isPositive ? 'bg-sky-500 dark:bg-sky-400' : 'bg-rose-500 dark:bg-rose-400';
        }
        // For all others, positive is bad (hotter, more flood/wildfire days), negative is good
        return isPositive ? 'bg-rose-500 dark:bg-rose-400' : 'bg-sky-500 dark:bg-sky-400';
    };

    const getSubtitle = () => {
        switch(riskType) {
            case 'heatwave':
                return 'Difference from the 5-year average temperature. Red bars are warmer, blue are cooler.';
            case 'flood':
                return 'Difference from the 5-year average number of heavy rain days. Red bars mean more days, blue mean fewer.';
            case 'wildfire':
                return 'Difference from the 5-year average number of high-risk days. Red bars mean more days, blue mean fewer.';
            case 'drought':
                return 'Difference from the 5-year average precipitation. Red bars are drier, blue are wetter.';
            default:
                return 'Difference from the 5-year average.';
        }
    };

    const maxAbsValue = Math.max(...data.map(d => Math.abs(d.value)), 0) * 1.1 || 1;
    const yAxisPrecision = (unit.includes('°C')) ? 2 : 1;

    return (
        <div 
            ref={chartRef}
            className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 relative"
            role="figure"
            aria-label={`Chart showing ${label} over the last 5 years.`}
        >
            <div
                role="tooltip"
                dangerouslySetInnerHTML={{ __html: tooltip.content }}
                className={`absolute z-10 px-3 py-1.5 text-xs font-semibold text-white bg-gray-900 rounded-md shadow-lg pointer-events-none transition-all duration-200 ease-out transform ${
                    tooltip.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
                style={{
                    left: tooltip.x,
                    top: tooltip.y,
                    transform: 'translate(-50%, -120%)',
                }}
            />
            
            <h4 className={`text-sm font-semibold mb-1 ${riskTextColors[riskType]}`}>{label} (Last 5 Years)</h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
                {getSubtitle()}
            </p>
            <div className="relative flex h-56 border-l border-b border-gray-300 dark:border-slate-600 pl-4 sm:pl-6">
                <span className="absolute -top-2 -left-4 text-xs text-gray-500 dark:text-slate-400" aria-hidden="true">+{maxAbsValue.toFixed(yAxisPrecision)}</span>
                <span className="absolute -bottom-2 -left-4 text-xs text-gray-500 dark:text-slate-400" aria-hidden="true">-{maxAbsValue.toFixed(yAxisPrecision)}</span>
                <div className="absolute top-1/2 left-0 w-full h-px bg-gray-400 dark:bg-slate-500 z-0">
                    <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-slate-400 font-medium" aria-hidden="true">0{unit.trim()}</span>
                </div>

                <div className="grid grid-cols-5 gap-2 sm:gap-4 w-full h-full">
                    {data.map((point) => {
                        const formattedValue = point.value.toFixed(yAxisPrecision);
                        const valueStr = `${point.value >= 0 ? '+' : ''}${formattedValue}${unit.trim()}`;
                        const content = `<div class='text-center'><b>${point.year}</b><br/>${valueStr}</div>`;
                        
                        return (
                            <div 
                                key={point.year} 
                                className="relative flex flex-col items-center w-full h-full outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded-md py-1 cursor-pointer"
                                onMouseEnter={(e) => handleShowTooltip(e, content)}
                                onMouseLeave={handleHideTooltip}
                                onFocus={(e) => handleShowTooltip(e, content)}
                                onBlur={handleHideTooltip}
                                tabIndex={0}
                                role="group"
                                aria-label={`${label} in ${point.year}: ${valueStr} from the 5-year average.`}
                            >
                                <div className="relative w-full flex-grow">
                                    <div
                                        className={`absolute w-full rounded-md transition-all duration-300 ease-out ${getBarColor(point.value)}`}
                                        style={{ 
                                            height: `${(Math.abs(point.value) / maxAbsValue) * 50}%`,
                                            ...(point.value >= 0 ? { bottom: '50%' } : { top: '50%' })
                                        }}
                                        aria-hidden="true"
                                    ></div>
                                </div>
                                <span className="flex-shrink-0 text-xs text-gray-600 dark:text-slate-300 mt-2 font-medium" aria-hidden="true">{point.year}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
             <p className="text-xs text-gray-500 dark:text-slate-400 text-center mt-3">Historical data sourced from Open-Meteo.</p>
        </div>
    );
};

export default HistoricalChart;