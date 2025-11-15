import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { Location, ClimateRiskType, RiskData, ActionItemStatus, UserProfile, ActiveView, Alert, ChatMessage, AiToolStatus } from './types';
import LocationSelector from './components/LocationSelector';
import RiskDashboard from './components/RiskDashboard';
import RiskDetailView from './components/RiskDetailView';
import CommunityView from './components/CommunityView';
import ChallengesView from './components/ChallengesView';
import Header from './components/Header';
import { LeafIcon, UsersIcon, ShieldCheckIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from './components/icons/AppIcons';
import * as geminiService from './services/geminiService';
import { getWeatherForecast } from './services/weatherService';
import { getHistoricalData } from './services/climateDataService';
import type { HistoricalData } from './services/climateDataService';
import { checkForAlerts } from './services/alertService';
import SplashScreen from './components/SplashScreen';
import OnboardingGuide from './components/OnboardingGuide';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import ChatView from './components/ChatView';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [location, setLocation] = useState<Location | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    
    const [activeView, setActiveView] = useState<ActiveView>('dashboard');
    const [selectedRisk, setSelectedRisk] = useState<ClimateRiskType | null>(null);

    const [riskData, setRiskData] = useState<Partial<Record<ClimateRiskType, Partial<RiskData>>>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [planApiError, setPlanApiError] = useState<string | null>(null);
    const [projectionApiError, setProjectionApiError] = useState<string | null>(null);
    const [showSplash, setShowSplash] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    
    const [userProfile, setUserProfile] = useState<UserProfile>(() => {
        try {
            const savedProfile = localStorage.getItem('clima-user-profile');
            return savedProfile ? JSON.parse(savedProfile) : { homeType: '', householdDetails: [], localEnvironment: [] };
        } catch (e) {
            return { homeType: '', householdDetails: [], localEnvironment: [] };
        }
    });

    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [dismissedAlerts, setDismissedAlerts] = useState<string[]>(() => {
         try {
            const saved = localStorage.getItem('clima-dismissed-alerts');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [aiToolStatus, setAiToolStatus] = useState<string>('idle');

    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('clima-theme');
        if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('clima-theme', theme);
    }, [theme]);

    const handleToggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };


    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        const riskTypes: ClimateRiskType[] = ['flood', 'heatwave', 'drought', 'wildfire'];
        const cachedData: Partial<Record<ClimateRiskType, RiskData>> = {};
        riskTypes.forEach(risk => {
            try {
                const data = localStorage.getItem(`clima-risk-data-${risk}`);
                if (data) cachedData[risk] = JSON.parse(data);
            } catch (e) {
                console.error(`Failed to load cached data for ${risk}:`, e);
                localStorage.removeItem(`clima-risk-data-${risk}`);
            }
        });
        setRiskData(cachedData);
    }, []);

    useEffect(() => {
        Object.entries(riskData).forEach(([risk, data]) => {
            if (data && data.actionPlan && data.futureProjection) {
                try {
                    const key = `clima-risk-data-${risk}`;
                    const currentCache = localStorage.getItem(key);
                    const newCache = JSON.stringify(data);
                    if (currentCache !== newCache) {
                         localStorage.setItem(key, newCache);
                    }
                } catch(e) { console.error("Failed to save data to cache:", e); }
            }
        });
    }, [riskData]);
    
    useEffect(() => {
        const checkAlerts = async () => {
            if (!location) return;
            try {
                const forecast = await getWeatherForecast(location);
                const potentialAlerts = checkForAlerts(forecast);
                const activeAlerts = potentialAlerts.filter(alert => !dismissedAlerts.includes(alert.id));
                setAlerts(activeAlerts);
            } catch (error) {
                console.error("Could not check for proactive alerts:", error);
            }
        };
        checkAlerts();
    }, [location, dismissedAlerts]);

    const changeView = (view: ActiveView) => {
        setPlanApiError(null);
        setProjectionApiError(null);
        setActiveView(view);
    };

    const handleSelectRisk = useCallback(async (risk: ClimateRiskType) => {
        if (!location) return;
        setSelectedRisk(risk);
        changeView('riskDetail');
        setPlanApiError(null);
        setProjectionApiError(null);

        const currentData = riskData[risk];
        if (currentData?.actionPlan && currentData?.futureProjection) return;
        if (isOffline) {
            changeView('dashboard'); 
            alert("You are offline. This report isn't cached.");
            return;
        }
        
        setIsLoading(true);

        // 1. Fetch Historical Data (required for projections)
        let historicalData: HistoricalData | null = null;
        try {
            if (!riskData[risk]?.historicalData) {
                 historicalData = await getHistoricalData(location, risk);
                 setRiskData(prev => ({ ...prev, [risk]: { ...prev[risk], historicalData: historicalData! } }));
            } else {
                historicalData = riskData[risk]!.historicalData!;
            }
        } catch(error: any) {
            setProjectionApiError("Could not load historical data, which is needed for projections.");
            // We can still try to get the action plan
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000)); // Delay for plan

        // 2. Fetch Action Plan
        if (!riskData[risk]?.actionPlan) {
            try {
                const newPlan = await geminiService.generateActionPlan(location, risk, userProfile);
                setRiskData(prev => {
                    const existingPlan = prev[risk]?.actionPlan;
                    const mergedPlan = { ...newPlan };
                    if (existingPlan) {
                        mergedPlan.items.forEach(newItem => {
                            const existingItem = existingPlan.items.find(i => i.title === newItem.title);
                            if (existingItem) newItem.status = existingItem.status;
                        });
                    }
                    return { ...prev, [risk]: { ...prev[risk], actionPlan: mergedPlan } };
                });
            } catch (error: any) { setPlanApiError(error.message || "Failed to generate action plan."); }
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // Delay for projection

        // 3. Fetch Future Projections (if historical data was fetched)
        if (historicalData && !riskData[risk]?.futureProjection) {
             try {
                const projection = await geminiService.generateFutureProjections(location, risk, historicalData);
                setRiskData(prev => ({ ...prev, [risk]: { ...prev[risk], futureProjection: projection } }));
            } catch (error: any) { setProjectionApiError(error.message || "Failed to generate future projection."); }
        }
        
        setIsLoading(false);

    }, [location, riskData, isOffline, userProfile]);

    const handleSetLocation = (newLocation: Location) => {
        setLocation(newLocation);
        setLocationError(null);
        const hasOnboarded = localStorage.getItem('hasCompletedOnboarding');
        if (!hasOnboarded) setShowOnboarding(true);
    };
    
    const handleEndOnboarding = () => {
        setShowOnboarding(false);
        localStorage.setItem('hasCompletedOnboarding', 'true');
    };

    const handleUpdateActionItemStatus = (risk: ClimateRiskType, itemTitle: string, status: ActionItemStatus) => {
        setRiskData(prev => {
            const newRiskData = JSON.parse(JSON.stringify(prev));
            const plan = newRiskData[risk]?.actionPlan;
            if (plan) {
                const item = plan.items.find((i: { title: string; }) => i.title === itemTitle);
                if (item) item.status = status;
            }
            return newRiskData;
        });
    };

    const handleUpdateProfile = (newProfile: UserProfile) => {
        setUserProfile(newProfile);
        localStorage.setItem('clima-user-profile', JSON.stringify(newProfile));
    };

    const handleDismissAlert = (alertId: string) => {
        const newDismissed = [...dismissedAlerts, alertId];
        setDismissedAlerts(newDismissed);
        localStorage.setItem('clima-dismissed-alerts', JSON.stringify(newDismissed));
    };
    
    const handleClearCache = () => {
        const riskTypes: ClimateRiskType[] = ['flood', 'heatwave', 'drought', 'wildfire'];
        riskTypes.forEach(risk => localStorage.removeItem(`clima-risk-data-${risk}`));
        setRiskData({});
        alert('All cached report data has been cleared.');
    };

    const handleResetProgress = () => {
        setRiskData(prev => {
            const resetData = JSON.parse(JSON.stringify(prev));
            Object.values(resetData).forEach((data: any) => {
                data.actionPlan?.items.forEach((item: any) => item.status = 'To Do');
            });
            return resetData;
        });
        localStorage.removeItem('personalizedChallenges');
        localStorage.removeItem('personalizedChallengesDate');
        alert('All action plan and challenge progress has been reset.');
        if (activeView === 'challenges') {
            setActiveView('dashboard');
            setTimeout(() => setActiveView('challenges'), 0);
        }
    };

    // This function is no longer needed as the feature has been removed.
    const handleResetImageQuota = () => {
        alert('This feature has been removed.');
    };
    
    const handleSendMessage = async (message: string) => {
        const newUserMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: message };
        const newHistory = [...chatHistory, newUserMessage];
        setChatHistory(newHistory);
        setAiToolStatus('thinking');

        try {
            const responseText = await geminiService.generateChatResponse(
                newHistory,
                { location, riskData },
                setAiToolStatus // Pass the setter to the service
            );
            const newModelMessage: ChatMessage = { id: `model-${Date.now()}`, role: 'model', text: responseText };
            setChatHistory(prev => [...prev, newModelMessage]);
        } catch (error: any) {
            const errorMessage: ChatMessage = { id: `error-${Date.now()}`, role: 'model', text: `Sorry, I encountered an error: ${error.message}` };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setAiToolStatus('idle');
        }
    };

    const renderContent = () => {
        if (!location) return <LocationSelector onLocationSet={handleSetLocation} onLocationError={setLocationError} error={locationError} />;
        switch (activeView) {
            case 'riskDetail': return selectedRisk && <RiskDetailView riskType={selectedRisk} data={riskData[selectedRisk] || null} isLoading={isLoading} onBack={() => changeView('dashboard')} location={location} planApiError={planApiError} projectionApiError={projectionApiError} onUpdateStatus={handleUpdateActionItemStatus} />;
            case 'community': return <CommunityView myLocation={location} />;
            case 'challenges': return <ChallengesView location={location} />;
            case 'profile': return <ProfileView profile={userProfile} onSave={handleUpdateProfile} />;
            case 'settings': return <SettingsView onClearCache={handleClearCache} onResetProgress={handleResetProgress} onBack={() => changeView('dashboard')} theme={theme} onToggleTheme={handleToggleTheme} />;
            case 'chat': return <ChatView history={chatHistory} onSendMessage={handleSendMessage} aiStatus={aiToolStatus} />;
            case 'dashboard':
            default: return <RiskDashboard onSelectRisk={handleSelectRisk} locationName={location.displayName} isLoading={isLoading} riskData={riskData} alerts={alerts} onDismissAlert={handleDismissAlert} />;
        }
    };
    
    const NavItem: React.FC<{ view: ActiveView; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
         <button onClick={() => changeView(view)} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors duration-200 relative ${activeView === view ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'}`}>
            {icon}
            <span>{label}</span>
            {activeView === view && <div className="absolute -bottom-1 h-1 w-8 bg-green-500 dark:bg-green-400 rounded-full"></div>}
        </button>
    );

    if (showSplash) return <SplashScreen />;

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans flex flex-col">
            <Header locationName={location?.displayName} isOffline={isOffline} onShowSettings={() => changeView('settings')} />
            <main className="flex-grow container mx-auto px-4 py-4 md:py-8 relative" style={{ paddingBottom: '80px' }}>
                {renderContent()}
                {showOnboarding && <OnboardingGuide onFinish={handleEndOnboarding} />}
            </main>
            {location && (
                 <nav data-tour-id="nav-bar" className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-slate-800 flex justify-around h-16 z-50">
                    <NavItem view="dashboard" label="Risks" icon={<ShieldCheckIcon className="h-6 w-6 mb-1" />} />
                    <NavItem view="community" label="Community" icon={<UsersIcon className="h-6 w-6 mb-1" />} />
                    <NavItem view="challenges" label="Challenges" icon={<LeafIcon className="h-6 w-6 mb-1" />} />
                    <NavItem view="chat" label="AI Chat" icon={<ChatBubbleLeftRightIcon className="h-6 w-6 mb-1" />} />
                    <NavItem view="profile" label="Profile" icon={<UserCircleIcon className="h-6 w-6 mb-1" />} />
                </nav>
            )}
        </div>
    );
};

export default App;