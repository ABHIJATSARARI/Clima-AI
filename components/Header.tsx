import React from 'react';
import { MapPinIcon, WifiSlashIcon, ClimaLogoIcon, CogIcon } from './icons/AppIcons';

interface HeaderProps {
    locationName?: string;
    isOffline?: boolean;
    onShowSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ locationName, isOffline, onShowSettings }) => {
    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <ClimaLogoIcon className="h-8 w-8" />
                         <h1 className="text-xl md:text-2xl font-extrabold text-green-700 dark:text-green-500 tracking-tight">
                            CLIMA<span className="text-green-400 dark:text-green-400">.</span>AI
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {locationName && (
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                                <MapPinIcon className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                <span className="font-medium truncate">{locationName}</span>
                            </div>
                        )}
                        {locationName && (
                             <button onClick={onShowSettings} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Open Settings">
                                <CogIcon className="h-6 w-6" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
             {isOffline && (
                <div className="bg-slate-700 text-white text-xs text-center py-1 flex items-center justify-center animate-fade-in">
                    <WifiSlashIcon className="h-4 w-4 mr-2" />
                    You are offline. Only previously viewed reports are available.
                </div>
            )}
        </header>
    );
};

export default Header;