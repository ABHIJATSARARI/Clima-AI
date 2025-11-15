import React, { useState, useEffect } from 'react';
import type { Location, ForecastDay } from '../types';
import { getWeatherForecast } from '../services/weatherService';
import Spinner from './Spinner';
import { SunIcon, CloudIcon, CloudRainIcon, CloudSunIcon } from './icons/AppIcons';

const WeatherIcon: React.FC<{ condition: ForecastDay['condition'], className?: string }> = ({ condition, className = 'w-10 h-10' }) => {
    switch (condition) {
        case 'sunny':
            return <SunIcon className={`${className} text-amber-500`} />;
        case 'cloudy':
            return <CloudIcon className={`${className} text-slate-500 dark:text-slate-400`} />;
        case 'rain':
            return <CloudRainIcon className={`${className} text-sky-600 dark:text-sky-400`} />;
        case 'partlyCloudy':
            return <CloudSunIcon className={`${className} text-gray-500 dark:text-gray-400`} />;
        default:
            return null;
    }
};

const ForecastCard: React.FC<{ day: ForecastDay; unit: 'celsius' | 'fahrenheit' }> = ({ day, unit }) => {
    const unitSymbol = unit === 'celsius' ? 'C' : 'F';
    return (
        <div className="flex flex-col items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-xl space-y-2 h-full">
            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{day.day}</p>
            <WeatherIcon condition={day.condition} />
            <div className="text-sm text-center">
                <span className="font-semibold text-slate-800 dark:text-slate-100">{day.highTemp}°</span>
                <span className="text-slate-500 dark:text-slate-400">/{day.lowTemp}°</span>
                <span className="font-semibold text-slate-600 dark:text-slate-300 ml-1">{unitSymbol}</span>
            </div>
        </div>
    );
};


const WeatherForecast: React.FC<{ location: Location }> = ({ location }) => {
    const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');

    useEffect(() => {
        if (!location) return;

        const fetchForecast = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getWeatherForecast(location, unit);
                setForecast(data);
            } catch (err) {
                console.error("Failed to fetch forecast:", err);
                setError("Could not load weather forecast at this time.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchForecast();
    }, [location, unit]);

    if (isLoading) {
        return (
            <div className="w-full h-40 bg-slate-100 dark:bg-slate-700/50 rounded-lg animate-pulse flex items-center justify-center">
                <Spinner />
                <p className="ml-4 text-slate-600 dark:text-slate-300">Loading forecast...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-yellow-100 dark:bg-yellow-900/40 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 rounded-md" role="alert">
                <p>{error}</p>
            </div>
        );
    }

    if (!forecast) return null;

    return (
        <div>
            <div className="flex justify-end mb-2">
                <div className="inline-flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                    <button 
                        onClick={() => setUnit('celsius')} 
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${unit === 'celsius' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100'}`}
                        aria-pressed={unit === 'celsius'}
                    >
                        °C
                    </button>
                    <button 
                        onClick={() => setUnit('fahrenheit')} 
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${unit === 'fahrenheit' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-100'}`}
                        aria-pressed={unit === 'fahrenheit'}
                    >
                        °F
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-5 gap-2 md:gap-4">
                {forecast.map((dayData, index) => (
                    <ForecastCard key={index} day={dayData} unit={unit} />
                ))}
            </div>
        </div>
    );
};

export default WeatherForecast;