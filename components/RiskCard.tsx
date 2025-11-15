import React from 'react';
import { ChevronRightIcon } from './icons/AppIcons';

interface RiskCardProps {
    title: string;
    description: string;
    icon: React.ReactElement<{ className?: string }>;
    color: string;
    onClick: () => void;
    disabled?: boolean;
    completedActions?: number;
    totalActions?: number;
}

const colorClasses: Record<string, { bg: string, text: string, iconBg: string, progress: string }> = {
    blue: { bg: 'from-blue-50 to-sky-100 dark:from-blue-900/50 dark:to-sky-900/50', text: 'text-blue-800 dark:text-blue-200', iconBg: 'bg-blue-200 dark:bg-blue-800/50', progress: 'bg-blue-500 dark:bg-blue-400' },
    orange: { bg: 'from-orange-50 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50', text: 'text-orange-800 dark:text-orange-200', iconBg: 'bg-orange-200 dark:bg-orange-800/50', progress: 'bg-orange-500 dark:bg-orange-400' },
    yellow: { bg: 'from-yellow-50 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50', text: 'text-yellow-800 dark:text-yellow-200', iconBg: 'bg-yellow-200 dark:bg-yellow-800/50', progress: 'bg-yellow-500 dark:bg-yellow-400' },
    red: { bg: 'from-red-50 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50', text: 'text-red-800 dark:text-red-200', iconBg: 'bg-red-200 dark:bg-red-800/50', progress: 'bg-red-500 dark:bg-red-400' },
};


const RiskCard: React.FC<RiskCardProps> = ({ title, description, icon, color, onClick, disabled, completedActions, totalActions }) => {
    const classes = colorClasses[color] || colorClasses['blue'];
    const hasProgress = typeof totalActions === 'number' && totalActions > 0;
    const progressPercentage = hasProgress && typeof completedActions === 'number' ? (completedActions / totalActions) * 100 : 0;
    
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full p-6 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800 transition-all duration-300 text-left flex flex-col justify-between h-full bg-gradient-to-br ${classes.bg} ${
                disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'transform hover:scale-[1.03] hover:shadow-lg dark:hover:border-slate-700'
            }`}
        >
            <div>
                <div className={`mb-4 w-12 h-12 rounded-xl flex items-center justify-center ${classes.text} ${classes.iconBg}`}>
                    {React.cloneElement(icon, { className: 'w-7 h-7' })}
                </div>
                <h3 className={`text-lg font-bold ${classes.text}`}>{title}</h3>
                <p className={`mt-1 text-sm opacity-80 ${classes.text}`}>{description}</p>
            </div>

            <div className="mt-4">
                 {hasProgress && (
                    <div className="mb-3">
                        <div className={`flex justify-between text-xs font-medium mb-1 opacity-80 ${classes.text}`}>
                            <span>Progress</span>
                            <span>{completedActions}/{totalActions}</span>
                        </div>
                        <div className="w-full bg-black/10 dark:bg-black/20 rounded-full h-1.5">
                            <div className={`${classes.progress} h-1.5 rounded-full`} style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>
                )}
                <div className="flex justify-end items-center">
                    <span className={`text-sm font-semibold mr-2 ${classes.text}`}>Analyze</span>
                    <ChevronRightIcon className={`h-5 w-5 ${classes.text}`} />
                </div>
            </div>
        </button>
    );
};

export default RiskCard;