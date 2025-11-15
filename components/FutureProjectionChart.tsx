import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import type { ClimateRiskType } from '../types';
import type { HistoricalData } from '../services/climateDataService';

interface FutureProjectionChartProps {
    historicalData: HistoricalData;
    projectionData: { year: string; value: number; }[];
    riskType: ClimateRiskType;
}

const FutureProjectionChart: React.FC<FutureProjectionChartProps> = ({ historicalData, projectionData }) => {
    const [activeDataIndex, setActiveDataIndex] = useState<number | null>(null);
    const historicalPathRef = useRef<SVGPathElement>(null);
    const projectionPathRef = useRef<SVGPathElement>(null);

    // Animate lines on load
    useEffect(() => {
        [historicalPathRef, projectionPathRef].forEach(ref => {
            if (ref.current) {
                const length = ref.current.getTotalLength();
                ref.current.style.strokeDasharray = `${length}`;
                ref.current.style.strokeDashoffset = `${length}`;
                // Delay the animation slightly to ensure it's visible
                setTimeout(() => {
                    if(ref.current) {
                       ref.current.style.animation = `draw-line 1.5s ease-out forwards`;
                    }
                }, 100);
            }
        });
    }, [historicalData, projectionData]);

    const combinedData = [...historicalData.data, ...projectionData];

    const allValues = combinedData.map(d => d.value);
    const yMin = Math.min(...allValues, 0);
    const yMax = Math.max(...allValues, 0);
    const yRange = yMax - yMin;
    const yPadding = yRange === 0 ? 1 : yRange * 0.2;
    const yAxisMin = yMin - yPadding;
    const yAxisMax = yMax + yPadding;
    const yAxisRange = yAxisMax - yAxisMin || 1;

    const SVG_WIDTH = 600;
    const SVG_HEIGHT = 350; // Made the chart wider
    const PADDING = { top: 20, right: 30, bottom: 60, left: 60 };
    const chartWidth = SVG_WIDTH - PADDING.left - PADDING.right;
    const chartHeight = SVG_HEIGHT - PADDING.top - PADDING.bottom;

    const getX = (index: number) => PADDING.left + (index / (combinedData.length - 1)) * chartWidth;
    const getY = (value: number) => PADDING.top + chartHeight - ((value - yAxisMin) / yAxisRange) * chartHeight;
    
    // --- INTELLIGENT Y-AXIS LABEL FILTERING ---
    const getFilteredYTicks = (min: number, max: number, maxTicks: number, minSpacing: number) => {
        const range = max - min;
        if (range === 0) return [min];
        
        const roughStep = range / (maxTicks - 1);
        const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep) || 0));
        const multipliers = [1, 2, 5, 10];
        const step = multipliers.map(m => m * magnitude).find(s => s > roughStep) || (10 * magnitude);
        
        let potentialTicks = [];
        for (let v = Math.floor(min / step) * step; v <= max; v += step) {
            potentialTicks.push(v);
        }
        if (min < 0 && max > 0 && !potentialTicks.some(t => Math.abs(t) < 1e-9)) {
             potentialTicks.push(0);
        }
        potentialTicks = [...new Set(potentialTicks)].sort((a,b) => b - a);

        // Filter for overlap
        const filteredTicks: number[] = [];
        let lastY = -Infinity;
        for(const tick of potentialTicks) {
            const currentY = getY(tick);
            if (Math.abs(currentY - lastY) > minSpacing) {
                filteredTicks.push(tick);
                lastY = currentY;
            }
        }
        return filteredTicks.sort((a, b) => a - b);
    };

    const yGridLines = getFilteredYTicks(yAxisMin, yAxisMax, 6, 40);

    const historicalPath = historicalData.data.map((p, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getY(p.value)}`).join(' ');
    const projectionLineData = [historicalData.data[historicalData.data.length - 1], ...projectionData];
    const projectionPath = projectionLineData.map((p, i) => `${i === 0 ? 'M' : 'L'}${getX(historicalData.data.length - 1 + i)},${getY(p.value)}`).join(' ');
    const lastHistoricalX = getX(historicalData.data.length - 1);
    const projectionAreaPath = `${projectionPath} L ${getX(combinedData.length - 1)} ${getY(yAxisMin)} L ${lastHistoricalX} ${getY(yAxisMin)} Z`;
    
    const activePoint = activeDataIndex !== null ? combinedData[activeDataIndex] : null;
    const bandWidth = chartWidth / (combinedData.length > 1 ? combinedData.length - 1 : 1);

    return (
        <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 relative" role="figure">
            <div className="relative w-full">
                <svg width="100%" height="auto" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="overflow-visible">
                    <defs>
                        <linearGradient id="projectionGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                        </linearGradient>
                         <filter id="line-shadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.15" />
                        </filter>
                    </defs>
                    
                    {/* Y-axis grid lines and labels */}
                    {yGridLines.map(value => (
                        <g key={`grid-${value}`} className="text-slate-400 dark:text-slate-500">
                            <line x1={PADDING.left} y1={getY(value)} x2={SVG_WIDTH - PADDING.right} y2={getY(value)} stroke="currentColor" strokeWidth="1" className={Math.abs(value) < 1e-9 ? "stroke-slate-500 dark:stroke-slate-400" : "stroke-slate-200 dark:stroke-slate-700"} strokeDasharray={Math.abs(value) < 1e-9 ? "none" : "3 5"} />
                            <text x={PADDING.left - 10} y={getY(value)} textAnchor="end" alignmentBaseline="middle" className="text-sm font-semibold fill-current">{value.toFixed(1)}</text>
                        </g>
                    ))}
                    <text x={PADDING.left - 45} y={PADDING.top + chartHeight/2} textAnchor="middle" transform={`rotate(-90, ${PADDING.left-45}, ${PADDING.top + chartHeight/2})`} className="text-sm font-semibold fill-slate-600 dark:fill-slate-400">{historicalData.unit}</text>
                    
                    {/* X-axis labels */}
                    {combinedData.map((p, i) => (
                        <text key={p.year} x={getX(i)} y={SVG_HEIGHT - PADDING.bottom + 20} textAnchor="middle" className="text-sm fill-slate-700 dark:fill-slate-300 font-semibold">{p.year}</text>
                    ))}
                    
                    {/* Projection Area Fill */}
                    <path d={projectionAreaPath} fill="url(#projectionGradient)" />

                    {/* Lines */}
                    <path ref={historicalPathRef} d={historicalPath} className="stroke-sky-500" fill="none" strokeWidth="3" strokeLinecap="round" filter="url(#line-shadow)" />
                    <path ref={projectionPathRef} d={projectionPath} className="stroke-rose-500" fill="none" strokeWidth="3" strokeDasharray="5 5" strokeLinecap="round" filter="url(#line-shadow)" />
                    
                    {/* Interaction Layer */}
                    <g onMouseLeave={() => setActiveDataIndex(null)}>
                        {combinedData.map((p, i) => (
                            <rect 
                                key={`interaction-${i}`}
                                x={getX(i) - bandWidth / 2}
                                y={PADDING.top}
                                width={bandWidth}
                                height={chartHeight}
                                fill="transparent"
                                onMouseEnter={() => setActiveDataIndex(i)}
                            />
                        ))}
                    </g>
                    
                    {/* Active State Tracker & Tooltip */}
                    {activePoint && (
                        <g style={{ pointerEvents: 'none' }} className="transition-opacity duration-200" opacity={activeDataIndex !== null ? 1 : 0}>
                            {/* Tracker Line */}
                            <line x1={getX(activeDataIndex!)} y1={PADDING.top} x2={getX(activeDataIndex!)} y2={SVG_HEIGHT - PADDING.bottom} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="1" />
                            
                            {/* Point Highlight */}
                            <circle cx={getX(activeDataIndex!)} cy={getY(activePoint.value)} r="8" className={`${activeDataIndex! >= historicalData.data.length ? "fill-rose-500" : "fill-sky-500"} opacity-30`} />
                            <circle cx={getX(activeDataIndex!)} cy={getY(activePoint.value)} r="5" className={`${activeDataIndex! >= historicalData.data.length ? "fill-rose-500" : "fill-sky-500"} stroke-white dark:stroke-slate-900`} strokeWidth="2" />
                            
                            {/* Tooltip */}
                             <g transform={`translate(${getX(activeDataIndex!)} ${getY(activePoint.value) - 10})`}>
                                 <path d="M-50 -35 L50 -35 L50 0 L10 0 L0 10 L-10 0 L-50 0 Z" className="fill-slate-800 opacity-90"/>
                                 <text y="-14" textAnchor="middle" className="fill-white font-bold text-sm">{activePoint.year}</text>
                                 <text y="-23" textAnchor="middle" className="fill-white font-bold text-sm" transform="translate(0, 20)">
                                     {`${activePoint.value >= 0 ? '+' : ''}${activePoint.value.toFixed(2)}${historicalData.unit.trim()}`}
                                 </text>
                            </g>
                        </g>
                    )}
                </svg>
            </div>
            
            {/* Legend */}
            <div className="flex justify-center items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-sky-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Historical</span>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="relative w-8 h-1">
                        <div className="absolute inset-0 bg-rose-500" style={{clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', maskImage: 'repeating-linear-gradient(-45deg, black, black 3px, transparent 3px, transparent 6px)'}}></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">AI Projection</span>
                </div>
            </div>
        </div>
    );
};

export default FutureProjectionChart;