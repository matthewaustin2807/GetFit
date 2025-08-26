import React, { createContext, useContext, useState } from 'react';

interface MealTypeContextType {
    selectedMealType: string;
    setSelectedMealType: (mealType: string) => void;
    onMealTypeChange: (callback: (date: string) => void) => () => void;
}

const MealTypeContext = createContext<MealTypeContextType | undefined>(undefined);

export const MealTypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedMealType, setSelectedMealType] = useState('breakfast')
    const [mealTypeChangeCallbacks, setMealTypeChangeCallbacks] = useState<((date: string) => void)[]>([]);
    
    const handleMealTypeChange = (mealType: string) => {
        setSelectedMealType(mealType)
    };

    const onMealTypeChange = (callback: (mealType: string) => void) => {
        setMealTypeChangeCallbacks(prev => [...prev, callback]);

        // Return cleanup function
        return () => {
            setMealTypeChangeCallbacks(prev => prev.filter(cb => cb !== callback));
        };
    };

    const value: MealTypeContextType = {
        selectedMealType,
        setSelectedMealType: handleMealTypeChange,
        onMealTypeChange: onMealTypeChange
    };

    return (
        <MealTypeContext.Provider value={value}>
            {children}
        </MealTypeContext.Provider>
    );
};

export const useMealType = () => {
    const context = useContext(MealTypeContext);
    if (!context) {
        throw new Error('useMealTime must be used within MealTimeProvider');
    }
    return context;
};