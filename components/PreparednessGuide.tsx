import React, { useEffect } from 'react';
import type { ActionItem } from '../types';
import { XMarkIcon } from './icons/AppIcons';

interface PreparednessGuideProps {
    items: ActionItem[];
    onClose: () => void;
}

const PreparednessGuide: React.FC<PreparednessGuideProps> = ({ items, onClose }) => {
    // Handle keyboard events for accessibility
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        // Add class to body to prevent scrolling
        document.body.classList.add('overflow-hidden');

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.classList.remove('overflow-hidden');
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-60 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="preparedness-guide-title"
        >
            <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up-fast">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <h2 id="preparedness-guide-title" className="text-xl font-bold text-gray-800 dark:text-slate-100">
                        Immediate Preparedness Guide
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-100 transition-colors"
                        aria-label="Close preparedness guide"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <p className="text-gray-600 dark:text-slate-300 mb-6">
                        These are the most critical, high-priority actions to take for your immediate safety based on your personalized plan.
                    </p>
                    <ul className="space-y-4">
                        {items.map((item, index) => (
                            <li key={index} className="p-4 bg-red-50 dark:bg-red-900/40 border-l-4 border-red-500 dark:border-red-400 rounded-r-md">
                                <h3 className="font-bold text-red-800 dark:text-red-200">{item.title}</h3>
                                <p className="mt-1 text-red-700 dark:text-red-300">{item.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex-shrink-0 text-right">
                     <button
                        onClick={onClose}
                        className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-sm hover:bg-green-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreparednessGuide;