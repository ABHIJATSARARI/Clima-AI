import React from 'react';
import type { ClimateRiskType, RiskData, Alert } from '../types';
import RiskCard from './RiskCard';
import { FloodIcon, HeatwaveIcon, DroughtIcon, WildfireIcon } from './icons/AppIcons';
import Alerts from './Alerts';

interface RiskDashboardProps {
    onSelectRisk: (risk: ClimateRiskType) => void;
    locationName: string;
    isLoading: boolean;
    riskData: Partial<Record<ClimateRiskType, Partial<RiskData>>>;
    alerts: Alert[];
    onDismissAlert: (alertId: string) => void;
}

const riskTypes: { type: ClimateRiskType; title: string; description: string; icon: React.ReactElement, color: string }[] = [
    { type: 'flood', title: 'Flood Risk', description: 'Analyze potential flooding scenarios.', icon: <FloodIcon />, color: 'blue' },
    { type: 'heatwave', title: 'Extreme Heat', description: 'Predict intense heatwave events.', icon: <HeatwaveIcon />, color: 'orange' },
    { type: 'drought', title: 'Drought Stress', description: 'Assess water scarcity and impact.', icon: <DroughtIcon />, color: 'yellow' },
    { type: 'wildfire', title: 'Wildfire Danger', description: 'Evaluate the risk of wildfires.', icon: <WildfireIcon />, color: 'red' },
];

const RiskDashboard: React.FC<RiskDashboardProps> = ({ onSelectRisk, locationName, isLoading, riskData, alerts, onDismissAlert }) => {
    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                 <Alerts alerts={alerts} onDismiss={onDismissAlert} onViewDetails={onSelectRisk} />
            </div>
            <div className="text-left mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-slate-100">Risk Dashboard</h2>
                <p className="text-gray-600 dark:text-slate-300 mt-1">Select a category below to generate an AI-powered simulation and action plan for <span className="font-semibold text-green-700 dark:text-green-400">{locationName}</span>.</p>
            </div>
            <div data-tour-id="risk-dashboard-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {riskTypes.map((risk, index) => {
                    const plan = riskData[risk.type]?.actionPlan;
                    const completedActions = plan?.items.filter(item => item.status === 'Completed').length;
                    const totalActions = plan?.items.length;

                    return (
                        <div key={risk.type} style={{ animationDelay: `${index * 100}ms` }} className="animate-slide-up">
                            <RiskCard
                                title={risk.title}
                                description={risk.description}
                                icon={risk.icon}
                                color={risk.color}
                                onClick={() => onSelectRisk(risk.type)}
                                disabled={isLoading}
                                completedActions={completedActions}
                                totalActions={totalActions}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RiskDashboard;