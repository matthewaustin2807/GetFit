import React, { createContext, useContext, useState } from 'react';

interface DateContextType {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    formattedDate: string;
    displayDate: string;
    isToday: boolean;
    goToPreviousDay: () => void;
    goToNextDay: () => void;
    goToToday: () => void;
    onDateChange: (callback: (date: string) => void) => () => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dateChangeCallbacks, setDateChangeCallbacks] = useState<((date: string) => void)[]>([]);

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        const newFormattedDate = date.toISOString().split('T')[0];

        // Notify all registered callbacks
        dateChangeCallbacks.forEach(callback => callback(newFormattedDate));
    };

    const onDateChange = (callback: (date: string) => void) => {
        setDateChangeCallbacks(prev => [...prev, callback]);

        // Return cleanup function
        return () => {
            setDateChangeCallbacks(prev => prev.filter(cb => cb !== callback));
        };
    };

    const goToPreviousDay = () => {
        const prevDay = new Date(selectedDate);
        prevDay.setDate(prevDay.getDate() - 1);
        handleDateChange(prevDay);
    };

    const goToNextDay = () => {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        handleDateChange(nextDay);
    };

    const goToToday = () => {
        handleDateChange(new Date());
    };


    const formattedDate = selectedDate.toISOString().split('T')[0];
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    const getDisplayDate = () => {
        if (isToday) return 'Today';

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (selectedDate.toDateString() === yesterday.toDateString()) return 'Yesterday';

        return selectedDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };
    const value: DateContextType = {
        selectedDate,
        setSelectedDate: handleDateChange,
        formattedDate,
        displayDate: getDisplayDate(),
        isToday,
        goToPreviousDay,
        goToNextDay,
        goToToday,
        onDateChange,
    };

    return (
        <DateContext.Provider value={value}>
            {children}
        </DateContext.Provider>
    );
};

export const useDate = () => {
    const context = useContext(DateContext);
    if (!context) {
        throw new Error('useDate must be used within DateProvider');
    }
    return context;
};