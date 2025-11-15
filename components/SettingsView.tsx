import React from 'react';
import { ArrowLeftIcon } from './icons/AppIcons';
import ThemeToggle from './ThemeToggle'; // Import the new component

interface SettingsViewProps {
    onClearCache: () => void;
    onResetProgress: () => void;
    onBack: () => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onClearCache, onResetProgress, onBack, theme, onToggleTheme }) => {

    const handleAction = (action: () => void, message: string) => {
        if (window.confirm(message)) {
            action();
        }
    };

    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="flex items-center text-green-600 dark:text-green-400 font-semibold mb-4 hover:text-green-800 dark:hover:text-green-300 transition-colors group">
                <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
                Back to Dashboard
            </button>
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 mb-2">Settings</h2>
            <p className="text-gray-600 dark:text-slate-300 mb-6">Manage your application data and settings.</p>

            <div className="space-y-6">
                {/* Appearance Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4">Appearance</h3>
                    <div className="flex items-center justify-between">
                         <p className="text-gray-700 dark:text-slate-200">Theme</p>
                         <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                    </div>
                     <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                        Switch between light and dark mode. Your preference is saved automatically.
                    </p>
                </div>
                
                {/* Data Management Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4">Data Management</h3>
                    <div className="space-y-4">
                        <div>
                            <button
                                onClick={() => handleAction(onClearCache, 'Are you sure you want to clear all cached climate reports? This action cannot be undone.')}
                                className="w-full sm:w-auto text-left sm:text-center px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                            >
                                Clear Cached Reports
                            </button>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 pl-1">
                                Removes all locally stored report data to free up space.
                            </p>
                        </div>
                        <div>
                             <button
                                onClick={() => handleAction(onResetProgress, 'Are you sure you want to reset all your progress? Your action plan and challenge statuses will be lost.')}
                                className="w-full sm:w-auto text-left sm:text-center px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
                            >
                                Reset All Progress
                            </button>
                             <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 pl-1">
                                Resets all action plans to 'To Do' and clears challenge completion.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;