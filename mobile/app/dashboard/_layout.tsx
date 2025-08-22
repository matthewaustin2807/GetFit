import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, PixelRatio } from 'react-native';
import { Slot, Stack, useLocalSearchParams, usePathname } from 'expo-router';
import { BottomTabBar } from '@/src/components/navigation/bottomtabbar';
import { SideDrawer } from '@/src/components/navigation/sidebar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SmartHeader } from '@/src/components/navigation/smartheader';
import { DateProvider, useDate } from '@/src/context/dateContext';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

export default function DashboardLayout() {
    return (
        <DateProvider>
            <DashboardLayoutContent />
        </DateProvider>
    );
}

const DashboardLayoutContent = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { selectedDate, setSelectedDate, displayDate } = useDate();

    const { mealType } = useLocalSearchParams<{ mealType: string }>();
    const [selectedMealType, setSelectedMealType] = useState(mealType || 'breakfast');

    const handleMealTypeChange = (newMealType: string) => {
        setSelectedMealType(newMealType);
        console.log('Changed meal type to:', newMealType);
    };

    // Update selected meal type when navigation parameter changes
    React.useEffect(() => {
        if (mealType) {
            setSelectedMealType(mealType);
        }
    }, [mealType]);


    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);
    const pathname = usePathname();

    // Determine if current page should show date picker
    const shouldShowDatePicker = pathname.includes('dashboard/nutrition/mealLoggingPage') ||
        pathname.includes('/meals') ||
        pathname.includes('/log-meal');

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
                    onMealTypeChange={handleMealTypeChange}
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