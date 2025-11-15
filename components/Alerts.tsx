import React from 'react';
import type { Alert, ClimateRiskType } from '../types';
import { XMarkIcon, InformationCircleIcon } from './icons/AppIcons';

interface AlertsProps {
    alerts: Alert[];
    onDismiss: (alertId: string) => void;
    onViewDetails: (risk: ClimateRiskType) => void;
}

const alertStyles: Record<ClimateRiskType, { bg: string, border: string, text: string, icon: string }> = {
    heatwave: { bg: 'bg-orange-50 dark:bg-orange-900/30', border: 'border-orange-500 dark:border-orange-500/70', text: 'text-orange-800 dark:text-orange-200', icon: 'text-orange-500 dark:text-orange-400' },
    flood: { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-500 dark:border-blue-500/70', text: 'text-blue-800 dark:text-blue-200', icon: 'text-blue-500 dark:text-blue-400' },
    wildfire: { bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-500 dark:border-red-500/70', text: 'text-red-800 dark:text-red-200', icon: 'text-red-500 dark:text-red-400' },
    drought: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-yellow-500 dark:border-yellow-500/70', text: 'text-yellow-800 dark:text-yellow-200', icon: 'text-yellow-500 dark:text-yellow-400' },
};

const Alerts: React.FC<AlertsProps> = ({ alerts, onDismiss, onViewDetails }) => {
    if (alerts.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            {alerts.map((alert) => {
                const styles = alertStyles[alert.riskType];
                return (
                    <div
                        key={alert.id}
                        className={`p-4 rounded-lg border-l-4 flex items-start animate-fade-in ${styles.bg} ${styles.border} ${styles.text}`}
                        role="alert"
                    >
                        <div className="flex-shrink-0">
                            <InformationCircleIcon className={`h-6 w-6 ${styles.icon}`} />
                        </div>
                        <div className="ml-3 flex-grow">
                            <p className="font-bold">{alert.title}</p>
                            <p className="text-sm mt-1">{alert.message}</p>
                             <button 
                                onClick={() => onViewDetails(alert.riskType)}
                                className="text-sm font-semibold mt-2 hover:underline"
                            >
                                View Details &rarr;
                            </button>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={() => onDismiss(alert.id)}
                                className={`-mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex transition-colors ${styles.bg} hover:bg-black/10 dark:hover:bg-white/10`}
                                aria-label="Dismiss"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Alerts;