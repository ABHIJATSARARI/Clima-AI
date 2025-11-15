import React, { useState } from 'react';
import type { ActionPlan, ActionItem, ActionItemStatus } from '../types';
import { ChevronDownIcon, LinkIcon } from './icons/AppIcons';

const priorityClasses: Record<string, string> = {
    High: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-500/50',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-500/50',
    Low: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-500/50',
};

const categoryClasses: Record<string, string> = {
    Home: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
    Community: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
    Farming: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    Conservation: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200'
};

const statusClasses: Record<ActionItemStatus, { bg: string, text: string }> = {
    'To Do': { bg: 'bg-slate-200 dark:bg-slate-600', text: 'text-slate-600 dark:text-slate-200' },
    'In Progress': { bg: 'bg-blue-200 dark:bg-blue-800/60', text: 'text-blue-700 dark:text-blue-200' },
    'Completed': { bg: 'bg-green-200 dark:bg-green-800/60', text: 'text-green-700 dark:text-green-200' },
};

const ActionItemCard: React.FC<{ item: ActionItem; onUpdateStatus: (title: string, status: ActionItemStatus) => void; }> = ({ item, onUpdateStatus }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const StatusButton: React.FC<{ status: ActionItemStatus }> = ({ status }) => (
        <button
            onClick={(e) => {
                e.stopPropagation(); // Prevent the accordion from toggling
                onUpdateStatus(item.title, status);
            }}
            disabled={item.status === status}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                item.status === status
                    ? `${statusClasses[status].bg} ${statusClasses[status].text}`
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
        >
            {status}
        </button>
    );

    return (
        <div className={`border rounded-lg mb-3 bg-white dark:bg-slate-800/50 shadow-sm overflow-hidden transition-all duration-300 ${item.status === 'Completed' ? 'border-green-300 dark:border-green-700/50 bg-green-50/50 dark:bg-green-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full text-left p-4 flex justify-between items-center transition-colors ${isOpen ? 'bg-slate-50 dark:bg-slate-700/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'} focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400`}
                aria-expanded={isOpen}
            >
                <div className="flex-grow pr-4">
                     <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${statusClasses[item.status].bg} ${statusClasses[item.status].text}`}>
                            {item.status}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${priorityClasses[item.priority]}`}>
                            {item.priority}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${categoryClasses[item.category]}`}>
                            {item.category}
                        </span>
                    </div>
                    <h4 className={`font-semibold transition-colors ${item.status === 'Completed' ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-800 dark:text-slate-100'}`}>{item.title}</h4>
                </div>
                <ChevronDownIcon className={`h-6 w-6 text-gray-400 dark:text-gray-500 transform transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`transition-all duration-300 ease-out overflow-hidden ${isOpen ? 'max-h-[30rem]' : 'max-h-0'}`}
            >
                <div className="px-4 pb-4 pt-0 text-gray-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700">
                     <p className="pt-4">{item.description}</p>
                     
                      {item.resources && item.resources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-700">
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">Helpful Resources</h5>
                            <ul className="space-y-2">
                                {item.resources.map((resource, index) => (
                                    <li key={index}>
                                        <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                                        >
                                            <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0 text-green-500 group-hover:text-green-700 dark:text-green-500 dark:group-hover:text-green-400" />
                                            <span className="group-hover:underline">{resource.title}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">Update Status</h5>
                        <div className="flex items-center gap-2">
                            <StatusButton status="To Do" />
                            <StatusButton status="In Progress" />
                            <StatusButton status="Completed" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ActionPlanProps {
    plan: ActionPlan;
    onUpdateStatus: (itemTitle: string, status: ActionItemStatus) => void;
}

const ActionPlanComponent: React.FC<ActionPlanProps> = ({ plan, onUpdateStatus }) => {
    const completedCount = plan.items.filter(item => item.status === 'Completed').length;
    const progress = plan.items.length > 0 ? (completedCount / plan.items.length) * 100 : 0;

    return (
        <div className="space-y-4">
             <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 rounded-lg">
                <p className="text-green-800 dark:text-green-200 text-sm">{plan.summary}</p>
            </div>
            
             <div className="bg-white dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-700 dark:text-slate-200 text-sm">Action Plan Progress</span>
                    <span className="font-bold text-green-600 dark:text-green-400 text-sm">{completedCount} / {plan.items.length} Completed</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                </div>
            </div>

            {plan.items.length > 0 ? (
                plan.items.map((item, index) => (
                    <ActionItemCard key={index} item={item} onUpdateStatus={onUpdateStatus} />
                ))
            ) : (
                 <div className="p-4 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-slate-300">No specific action items were generated. Please refine your query or try again.</p>
                </div>
            )}
        </div>
    );
};

export default ActionPlanComponent;