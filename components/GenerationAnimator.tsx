import React, { useState, useEffect } from 'react';

interface GenerationAnimatorProps {
    text: string;
}

const statusMessages = [
    "Initializing AI models...",
    "Accessing hyper-local datasets...",
    "Running climate simulations...",
    "Analyzing risk factors...",
    "Compiling insights...",
    "Finalizing your report..."
];

const GenerationAnimator: React.FC<GenerationAnimatorProps> = ({ text }) => {
    const [statusIndex, setStatusIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStatusIndex(prevIndex => (prevIndex + 1) % statusMessages.length);
        }, 2000); // Change status message every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full aspect-video md:aspect-[2/1] bg-slate-100 border border-slate-200/80 rounded-xl flex flex-col items-center justify-center text-center p-4">
            <div className="flex items-end justify-center h-12 space-x-2">
                <div className="generation-bar w-4 h-full bg-green-300 rounded-t-full" style={{ animationDelay: '0s' }}></div>
                <div className="generation-bar w-4 h-full bg-green-400 rounded-t-full" style={{ animationDelay: '0.2s' }}></div>
                <div className="generation-bar w-4 h-full bg-green-500 rounded-t-full" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="mt-6 text-slate-700 font-semibold">{text}</p>
            <p className="text-sm text-slate-500 mt-1 h-5 transition-opacity duration-300">
                {statusMessages[statusIndex]}
            </p>
        </div>
    );
};

export default GenerationAnimator;