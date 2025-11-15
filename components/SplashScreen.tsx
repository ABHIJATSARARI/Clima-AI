import React from 'react';
import { ClimaLogoIcon } from './icons/AppIcons';

const SplashScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center z-50 animate-[splash-fade-out_0.5s_ease-in_4.5s_forwards]">
            
            {/* Layered Reveal Animation */}
            <div className="w-36 h-36 relative">
                 <ClimaLogoIcon className="absolute inset-0" />
            </div>

            {/* Final Text Reveal */}
            <div className="mt-6 text-center animate-[fade-scale-in_0.7s_cubic-bezier(0.25,0.1,0.25,1)_2.5s_forwards] opacity-0">
                <div className="flex justify-center items-center gap-2">
                    <h1 className="text-3xl font-extrabold text-green-700 dark:text-green-500 tracking-tight">
                        CLIMA<span className="text-green-400 dark:text-green-400">.</span>AI
                    </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Your Personal Climate Risk Advisor</p>
            </div>
        </div>
    );
};

export default SplashScreen;