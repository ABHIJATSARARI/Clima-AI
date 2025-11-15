import React, { useState } from 'react';
import type { UserProfile } from '../types';

interface ProfileViewProps {
    profile: UserProfile;
    onSave: (newProfile: UserProfile) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onSave }) => {
    const [formData, setFormData] = useState<UserProfile>(profile);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleHomeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, homeType: e.target.value as UserProfile['homeType'] }));
    };

    const handleCheckboxChange = (
        category: 'householdDetails' | 'localEnvironment',
        value: string
    ) => {
        setFormData(prev => {
            const currentValues = prev[category] as string[];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [category]: newValues };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000); // Hide message after 2 seconds
    };
    
    const CheckboxOption: React.FC<{
        category: 'householdDetails' | 'localEnvironment';
        value: string;
        label: string;
    }> = ({ category, value, label }) => (
        <label className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <input
                type="checkbox"
                checked={(formData[category] as string[]).includes(value)}
                onChange={() => handleCheckboxChange(category, value)}
                className="h-5 w-5 rounded border-gray-300 dark:border-slate-500 text-green-600 dark:text-green-500 focus:ring-green-500 dark:focus:ring-green-400 bg-transparent dark:bg-slate-800"
            />
            <span className="text-gray-700 dark:text-slate-200">{label}</span>
        </label>
    );

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 mb-2">My Profile</h2>
            <p className="text-gray-600 dark:text-slate-300 mb-6">
                Provide more context about your situation to receive even more personalized AI-powered action plans.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Home Type Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4">Home Type</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                        Knowing your home type helps tailor recommendations for structural safety and utility management.
                    </p>
                    <select
                        value={formData.homeType}
                        onChange={handleHomeTypeChange}
                        className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition bg-white dark:bg-slate-700 dark:text-slate-100"
                    >
                        <option value="">Select a home type...</option>
                        <option value="house">Single-Family House</option>
                        <option value="apartment">Apartment / Condo</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                {/* Household Details Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4">Household Details</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                        This information helps the AI provide specific advice for evacuation plans and emergency kits.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <CheckboxOption category="householdDetails" value="pets" label="I have pets" />
                        <CheckboxOption category="householdDetails" value="children" label="I have children" />
                        <CheckboxOption category="householdDetails" value="elderly" label="I have elderly members" />
                    </div>
                </div>

                {/* Local Environment Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/50">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4">Local Environment</h3>
                     <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                        Your immediate surroundings can significantly influence certain risks, like floods or wildfires.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <CheckboxOption category="localEnvironment" value="river" label="Near a river/water body" />
                         <CheckboxOption category="localEnvironment" value="forest" label="In or near a dense forest" />
                         <CheckboxOption category="localEnvironment" value="denseUrban" label="In a dense urban area" />
                         <CheckboxOption category="localEnvironment" value="coastal" label="In a coastal area" />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    {saveSuccess && (
                        <p className="text-green-600 dark:text-green-400 font-semibold animate-fade-in">Profile Saved!</p>
                    )}
                    <button
                        type="submit"
                        className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-green-700 transition-colors"
                    >
                        Save Profile
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileView;