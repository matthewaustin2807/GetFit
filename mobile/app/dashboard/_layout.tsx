import { BottomTabBar } from '@/src/components/navigation/bottomtabbar';
import { SideDrawer } from '@/src/components/navigation/sidebar';
import { SmartHeader } from '@/src/components/navigation/smartheader';
import { DateProvider, useDate } from '@/src/context/dateContext';
import { MealTypeProvider, useMealType } from '@/src/context/mealTypeContext';
import { Slot, Stack, useLocalSearchParams, usePathname } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, PixelRatio, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

export default function DashboardLayout() {
    return (
        <MealTypeProvider>
            <DateProvider>
                <DashboardLayoutContent />
            </DateProvider>
        </MealTypeProvider>

    );
}

const DashboardLayoutContent = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { selectedDate, setSelectedDate, displayDate } = useDate();
    const { selectedMealType, setSelectedMealType } = useMealType();

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);
    const pathname = usePathname();

    // Determine if current page should show date picker
    const shouldShowDatePicker = pathname.includes('dashboard/nutrition/mealLoggingPage') ||
        pathname.includes('/meals') ||
        pathname.includes('/log-meal');

    // Pages to show meal type
    const shouldShowMealPicker = pathname.includes('dashboard/nutrition/mealSearchPage')

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container}>
                <SmartHeader
                    title="Get Fit"
                    onMenuPress={() => setIsDrawerOpen(true)}
                    showDatePicker={shouldShowDatePicker}
                    showMealPicker={shouldShowMealPicker}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    displayDate={displayDate}
                    selectedMealType={selectedMealType}
                    onMealTypeChange={setSelectedMealType}
                />
                {/* Main content area */}
                <View style={styles.content}>
                    <Slot />
                </View>

                {/* Bottom Tab Bar */}
                <BottomTabBar
                    variant="floating"
                    activeColor="#667eea"
                    inactiveColor="#999"
                    showLabels={true}
                />
                <SideDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingHorizontal: wp(5),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    menuButton: {
        paddingTop: wp(2),
    },
    hamburger: {
        fontSize: rf(36),
        color: '#4a5568',
    },
    content: {
        flex: 1,
        paddingBottom: 90, // Space for bottom tab bar
    },
});