import React, { useState } from 'react';
import type { Location } from '../types';
import Spinner from './Spinner';
import { MapPinIcon } from './icons/AppIcons';

interface LocationSelectorProps {
    onLocationSet: (location: Location) => void;
    onLocationError: (error: string) => void;
    error: string | null;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationSet, onLocationError, error }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            onLocationError("Geolocation is not supported by your browser.");
            return;
        }

        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const displayName = `Lat ${position.coords.latitude.toFixed(2)}, Lon ${position.coords.longitude.toFixed(2)}`;
                const location: Location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    displayName: displayName
                };
                onLocationSet(location);
                setIsLoading(false);
            },
            () => {
                onLocationError("Unable to retrieve your location. Please enable location services.");
                setIsLoading(false);
            }
        );
    };

    return (
        <div className="relative flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center p-4 overflow-hidden">
             <div 
                className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-5"
                style={{backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg')"}}
            ></div>
            <div className="relative max-w-md w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
                <div className="mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 mb-2">Welcome to CLIMA</h2>
                    <p className="text-gray-600 dark:text-slate-300">Understand your local climate risks and get a personalized action plan, powered by AI.</p>
                </div>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded-md" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}
                
                <button
                    onClick={handleGetLocation}
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105 flex items-center justify-center text-lg"
                >
                    {isLoading ? (
                        <Spinner />
                    ) : (
                        <>
                            <MapPinIcon className="h-6 w-6 mr-3" />
                            Find My Location
                        </>
                    )}
                </button>
                 <p className="text-xs text-gray-500 dark:text-slate-400 mt-4">We use your location to provide hyper-local climate risk data. We do not store your location information.</p>
            </div>
        </div>
    );
};

export default LocationSelector;