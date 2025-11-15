import React, { useState, useEffect } from 'react';
import type { Challenge, Location } from '../types';
import * as geminiService from '../services/geminiService';
import { CheckCircleIcon, SparklesIcon, EnergyIcon, WaterIcon, WasteIcon, TransportIcon } from './icons/AppIcons';
import Spinner from './Spinner';

interface ChallengesViewProps {
    location: Location;
}

const defaultChallenges: Challenge[] = [
    { id: 'd1', title: 'Go Meatless for a Day', description: 'Avoid meat and dairy products for one full day.', category: 'Waste', completed: false },
    { id: 'd2', title: 'Unplug Electronics', description: 'Unplug chargers and appliances when not in use.', category: 'Energy', completed: false },
    { id: 'd3', title: '5-Minute Shower', description: 'Limit your shower time to 5 minutes to save water and energy.', category: 'Water', completed: false },
    { id: 'd4', title: 'Use a Reusable Bottle', description: 'Avoid single-use plastic bottles for a day.', category: 'Waste', completed: false },
    { id: 'd5', title: 'Walk or Bike for a Short Trip', description: 'Choose human-powered transport over a car for a trip under 2 miles.', category: 'Transport', completed: false },
];

const ChallengeItem: React.FC<{ challenge: Challenge; onToggle: (id: string) => void; }> = ({ challenge, onToggle }) => {
    const iconMap: Record<Challenge['category'], React.ReactNode> = {
        Energy: <EnergyIcon className="w-5 h-5" />,
        Water: <WaterIcon className="w-5 h-5" />,
        Waste: <WasteIcon className="w-5 h-5" />,
        Transport: <TransportIcon className="w-5 h-5" />,
    };

    return (
        <div
            onClick={() => onToggle(challenge.id!)}
            className={`p-4 rounded-xl shadow-sm cursor-pointer transition-all duration-300 flex items-center group relative overflow-hidden ${
                challenge.completed
                    ? 'bg-green-100/70 dark:bg-green-900/40 border-l-4 border-green-500 dark:border-green-400'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-l-4 border-transparent hover:border-green-300 dark:hover:border-green-600'
            }`}
            role="button"
            tabIndex={0}
            aria-pressed={challenge.completed}
        >
            <div className={`absolute top-2 right-2 text-xs font-bold uppercase tracking-wider transition-opacity duration-300 ${challenge.completed ? 'opacity-100 text-green-600 dark:text-green-300' : 'opacity-0'}`}>
                Done!
            </div>
            <div className="flex-shrink-0 mr-4">
                <div className={`relative h-10 w-10 flex items-center justify-center rounded-full transition-all duration-300 ${challenge.completed ? 'bg-green-500 dark:bg-green-400' : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-green-100 dark:group-hover:bg-green-900/50'}`}>
                    <div className={`absolute inset-0 transform scale-0 transition-transform duration-300 rounded-full ${challenge.completed ? 'scale-100 bg-green-500' : ''}`}></div>
                    <div className={`relative text-slate-500 dark:text-slate-400 transition-colors duration-300 ${challenge.completed ? 'text-white' : 'group-hover:text-green-600 dark:group-hover:text-green-400'}`}>
                        {iconMap[challenge.category]}
                    </div>
                    {challenge.completed && (
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 p-0.5 rounded-full">
                           <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400" />
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-grow">
                <h4 className={`font-bold text-base transition-colors ${challenge.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-800 dark:text-slate-100'}`}>
                    {challenge.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-slate-300">{challenge.description}</p>
            </div>
        </div>
    );
};


const ChallengesView: React.FC<ChallengesViewProps> = ({ location }) => {
    const [dailyTip, setDailyTip] = useState<string>('');
    const [isLoadingTip, setIsLoadingTip] = useState<boolean>(true);

    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [isLoadingChallenges, setIsLoadingChallenges] = useState<boolean>(true);
    const [challengesError, setChallengesError] = useState<string | null>(null);

    // Fetch AI Tip of the Day (cached)
    useEffect(() => {
        const fetchTip = async () => {
            setIsLoadingTip(true);
            const cachedTip = localStorage.getItem('dailyTip');
            const cacheDate = localStorage.getItem('dailyTipDate');
            const today = new Date().toISOString().split('T')[0];

            if (cachedTip && cacheDate === today) {
                setDailyTip(cachedTip);
                setIsLoadingTip(false);
                return;
            }

            try {
                const tip = await geminiService.generateDailyTip();
                setDailyTip(tip);
                localStorage.setItem('dailyTip', tip);
                localStorage.setItem('dailyTipDate', today);
            } catch (error) {
                console.error("Failed to fetch daily tip:", error);
                setDailyTip("Small changes, like using a reusable water bottle, make a big difference over time.");
            } finally {
                setIsLoadingTip(false);
            }
        };
        fetchTip();
    }, []);
    
    // Fetch Personalized Challenges (cached)
    useEffect(() => {
        const fetchChallenges = async () => {
             setIsLoadingChallenges(true);
             setChallengesError(null);
             const cacheKey = 'personalizedChallenges';
             const cacheDateKey = 'personalizedChallengesDate';

             const cachedData = localStorage.getItem(cacheKey);
             const cacheDate = localStorage.getItem(cacheDateKey);
             const today = new Date().toISOString().split('T')[0];
             
             if (cachedData && cacheDate === today) {
                 setChallenges(JSON.parse(cachedData));
                 setIsLoadingChallenges(false);
                 return;
             }

             try {
                const generated = await geminiService.generatePersonalizedChallenges(location);
                const newChallenges = generated.map((c, index) => ({
                    ...c,
                    id: `gen-${index}-${Date.now()}`,
                    completed: false
                }));
                setChallenges(newChallenges);
                localStorage.setItem(cacheKey, JSON.stringify(newChallenges));
                localStorage.setItem(cacheDateKey, today);
             } catch(error: any) {
                console.error("Failed to fetch personalized challenges:", error);
                setChallengesError("Could not load personalized challenges. Using a default set for today.");
                setChallenges(defaultChallenges);
             } finally {
                setIsLoadingChallenges(false);
             }
        };

        if (location) {
            fetchChallenges();
        }
    }, [location]);

    const handleToggleChallenge = (challengeId: string) => {
        const updatedChallenges = challenges.map(c =>
            c.id === challengeId ? { ...c, completed: !c.completed } : c
        );
        setChallenges(updatedChallenges);
        // Persist completion state
        localStorage.setItem('personalizedChallenges', JSON.stringify(updatedChallenges));
    };

    const completedCount = challenges.filter(c => c.completed).length;
    const progress = challenges.length > 0 ? (completedCount / challenges.length) * 100 : 0;
    
    const renderChallenges = () => {
        if(isLoadingChallenges) {
            return (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                         <div key={i} className="p-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center animate-pulse">
                            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full mr-4"></div>
                            <div className="flex-grow space-y-2">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="space-y-3">
                 {challenges.map(challenge => (
                    <ChallengeItem key={challenge.id} challenge={challenge} onToggle={handleToggleChallenge} />
                ))}
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 mb-2">Carbon Footprint Challenges</h2>
            <p className="text-gray-600 dark:text-slate-300 mb-6">Complete these personalized daily challenges to make a big impact.</p>

            <div className="mb-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg flex items-start">
                <SparklesIcon className="h-8 w-8 mr-4 mt-1 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-lg">AI Tip of the Day</h4>
                    {isLoadingTip ? <div className="h-5 w-3/4 bg-green-400/50 rounded animate-pulse mt-1"></div> : <p className="opacity-90">{dailyTip}</p>}
                </div>
            </div>

            <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700 dark:text-slate-200">Daily Progress</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{completedCount} / {challenges.length} Done</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600 h-3 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                </div>
                {progress === 100 && (
                    <p className="text-center text-sm font-semibold text-green-700 dark:text-green-400 mt-3 animate-fade-in">
                        Great job! You've completed all challenges for today! 🥳
                    </p>
                )}
            </div>

            {challengesError && (
                 <div className="mb-4 bg-yellow-100 dark:bg-yellow-900/40 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-3 rounded-md text-sm" role="alert">
                    <p>{challengesError}</p>
                </div>
            )}
            
            {renderChallenges()}
        </div>
    );
};

export default ChallengesView;