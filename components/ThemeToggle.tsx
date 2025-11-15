import React from 'react';
import { SunIcon, MoonIcon } from './icons/AppIcons';

interface ThemeToggleProps {
    theme: 'light' | 'dark';
    onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
    const isDark = theme === 'dark';

    return (
        <button
            onClick={onToggle}
            className="relative inline-flex items-center h-8 w-14 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800"
            role="switch"
            aria-checked={isDark}
        >
            <span className="sr-only">Toggle theme</span>
            <div
                className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
                    isDark ? 'translate-x-6' : 'translate-x-0'
                }`}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <SunIcon
                        className={`h-4 w-4 text-amber-500 transition-opacity duration-300 ${
                            isDark ? 'opacity-0' : 'opacity-100'
                        }`}
                    />
                    <MoonIcon
                        className={`h-4 w-4 text-slate-500 transition-opacity duration-300 ${
                            isDark ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                </div>
            </div>
        </button>
    );
};

export default ThemeToggle;