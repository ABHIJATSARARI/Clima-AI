import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { LightBulbIcon } from './icons/AppIcons';

interface OnboardingGuideProps {
    onFinish: () => void;
}

interface TourStep {
    targetId: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
    {
        targetId: 'risk-dashboard-grid',
        title: 'Your Risk Dashboard',
        content: "This is your main dashboard. Tap on any risk card, like 'Flood Risk' or 'Extreme Heat', to generate a detailed local analysis and get a personalized action plan.",
        position: 'bottom',
    },
    {
        targetId: 'nav-bar',
        title: 'Explore More Features',
        content: 'Use the navigation bar to compare risks with other communities or take on daily challenges to reduce your carbon footprint.',
        position: 'top',
    },
     {
        targetId: 'final-step-modal', // This is a virtual target for the final modal
        title: "You're All Set!",
        content: "You're ready to start exploring. Dive in to understand your local climate risks and learn how you can prepare.",
        position: 'bottom'
    }
];

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onFinish }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ opacity: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);

    const currentStep = tourSteps[stepIndex];

    // Effect to find the target element and get its dimensions
    useLayoutEffect(() => {
        if (currentStep.targetId === 'final-step-modal') {
             setTargetRect(null);
             return;
        }
        const element = document.querySelector(`[data-tour-id="${currentStep.targetId}"]`);
        if (element) {
            setTargetRect(element.getBoundingClientRect());
        } else {
            console.warn(`Onboarding target not found: ${currentStep.targetId}`);
            handleNext();
        }
    }, [stepIndex]);
    
    // Effect to recalculate position on window resize
    useEffect(() => {
        const handleResize = () => {
            if (currentStep.targetId !== 'final-step-modal') {
                const element = document.querySelector(`[data-tour-id="${currentStep.targetId}"]`);
                if (element) {
                    setTargetRect(element.getBoundingClientRect());
                }
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [currentStep.targetId]);

    // Effect to calculate the tooltip's position dynamically
    useLayoutEffect(() => {
        if (currentStep.targetId === 'final-step-modal') {
            setTooltipStyle({
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 1
            });
            return;
        }
        
        if (!targetRect || !tooltipRef.current) return;

        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const { innerWidth, innerHeight } = window;
        const margin = 16;
        let top: number, left: number;
        
        const preferredPosition = currentStep.position || 'bottom';

        // Vertical positioning with auto-flip
        const spaceBelow = innerHeight - targetRect.bottom - tooltipRect.height - margin;
        const spaceAbove = targetRect.top - tooltipRect.height - margin;

        if (preferredPosition === 'bottom' && spaceBelow >= 0) {
            top = targetRect.bottom + margin;
        } else if (preferredPosition === 'top' && spaceAbove >= 0) {
            top = targetRect.top - tooltipRect.height - margin;
        } else {
            // Auto-flip based on whichever side has more space
            if (spaceBelow > spaceAbove) {
                top = targetRect.bottom + margin;
            } else {
                top = targetRect.top - tooltipRect.height - margin;
            }
        }
        
        // Horizontal positioning with boundary detection
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        
        // Clamp to screen edges to prevent overflow
        if (left < margin) left = margin;
        if (left + tooltipRect.width > innerWidth - margin) {
            left = innerWidth - tooltipRect.width - margin;
        }

        setTooltipStyle({
            top: `${top}px`,
            left: `${left}px`,
            opacity: 1
        });

    }, [targetRect, stepIndex]);


    const handleNext = () => {
        if (stepIndex < tourSteps.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            onFinish();
        }
    };

    const isFinalStep = stepIndex === tourSteps.length - 1;

    return (
        <div className="fixed inset-0 z-[100] animate-fade-in" role="dialog" aria-modal="true">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

             {/* Spotlight effect */}
             {targetRect && (
                <div
                    className="absolute transition-all duration-300 ease-in-out rounded-lg"
                    style={{
                        top: `${targetRect.top - 8}px`,
                        left: `${targetRect.left - 8}px`,
                        width: `${targetRect.width + 16}px`,
                        height: `${targetRect.height + 16}px`,
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                        pointerEvents: 'none',
                    }}
                ></div>
            )}
            
            {/* Tooltip / Modal */}
            <div
                ref={tooltipRef}
                className="absolute w-[calc(100%-2rem)] max-w-sm p-5 bg-white dark:bg-slate-800 rounded-lg shadow-2xl transition-all duration-300 ease-in-out"
                style={tooltipStyle}
            >
                <div className="flex items-start mb-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mr-4">
                        <LightBulbIcon className="w-6 h-6" />
                    </div>
                    <div>
                         <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">{currentStep.title}</h3>
                    </div>
                </div>

                <p className="text-gray-600 dark:text-slate-300 text-sm mb-5">{currentStep.content}</p>

                <div className="flex justify-between items-center">
                    <button onClick={onFinish} className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-slate-100">
                        Skip
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-5 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {isFinalStep ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingGuide;