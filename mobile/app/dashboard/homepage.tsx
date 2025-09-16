import ChartCard from '@/src/components/charts/chartcard';
import QuickActionCard from '@/src/components/quickaction/quickactioncard';
import { HorizontalScrollContainer } from '@/src/components/horizontalscrollview';
import { SideDrawer } from '@/src/components/navigation/sidebar';
import { useAuthStore } from '@/src/store/authStore';
import { OpenSans_400Regular } from '@expo-google-fonts/open-sans';
import { Pacifico_400Regular, useFonts } from '@expo-google-fonts/pacifico';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { format } from "date-fns";
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, PixelRatio, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import WaterLogModal from '@/src/components/mealLogging/waterLoggingComponents/waterLogModal'
import { NutritionApiService } from '@/src/services/nutrition/nutritionApi';
import { NutritionSummary } from '@/src/types/nutrition';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

const Drawer = createDrawerNavigator();

const HomePage = () => {
    let [fontsLoaded] = useFonts({
        Pacifico_400Regular,
        OpenSans_400Regular,
    });

    const { user, isAuthenticated } = useAuthStore();

    // Water tracking state
    const [showWaterModal, setShowWaterModal] = useState(false);
    const [currentWaterIntake, setCurrentWaterIntake] = useState(0);
    const [dailyWaterGoal] = useState(8);
    const [loadingWater, setLoadingWater] = useState(false);

    // Nutrition summary state
    const [nutritionSummary, setNutritionSummary] = useState<NutritionSummary | null>(null);
    const [loadingNutrition, setLoadingNutrition] = useState(false);

    const quickActionsData = [
        {
            title: 'Log Water',
            icon: '💧',
            subtitle: 'Track your hydration',
            color: 'lightblue',
            onPress: () => setShowWaterModal(true)
        }
    ];

    const chartsData = [
        {
            title: 'Calories',
            value: nutritionSummary?.summary.totalCalories || 0,
            maxValue: user?.dailyCalories || 2200,
            unit: 'cal',
            color: '#667eea',
            progress: nutritionSummary ? (nutritionSummary.summary.totalCalories / (user?.dailyCalories || 2200)) : 0,
            icon: '🔥',
            subtitle: `${Math.max(0, (user?.dailyCalories || 2200) - (nutritionSummary?.summary.totalCalories || 0))} remaining`
        },
        {
            title: 'Protein',
            value: Math.round(nutritionSummary?.summary.totalProtein || 0),
            maxValue: user?.dailyProtein || 150,
            unit: 'g',
            color: '#f093fb',
            progress: nutritionSummary ? (nutritionSummary.summary.totalProtein / (user?.dailyProtein || 150)) : 0,
            icon: '🥩',
            subtitle: `${Math.max(0, (user?.dailyProtein || 150) - Math.round(nutritionSummary?.summary.totalProtein || 0))}g remaining`
        },
        {
            title: 'Carbs',
            value: Math.round(nutritionSummary?.summary.totalCarbs || 0),
            maxValue: user?.dailyCarbs || 275,
            unit: 'g',
            color: '#4facfe',
            progress: nutritionSummary ? (nutritionSummary.summary.totalCarbs / (user?.dailyCarbs || 275)) : 0,
            icon: '🍞',
            subtitle: `${Math.max(0, (user?.dailyCarbs || 275) - Math.round(nutritionSummary?.summary.totalCarbs || 0))}g remaining`
        },
        {
            title: 'Fat',
            value: Math.round(nutritionSummary?.summary.totalFat || 0),
            maxValue: user?.dailyFat || 97,
            unit: 'g',
            color: '#43e97b',
            progress: nutritionSummary ? (nutritionSummary.summary.totalFat / (user?.dailyFat || 97)) : 0,
            icon: '🥑',
            subtitle: `${Math.max(0, (user?.dailyFat || 97) - Math.round(nutritionSummary?.summary.totalFat || 0))}g remaining`
        },
        {
            title: 'Water',
            value: currentWaterIntake,
            maxValue: dailyWaterGoal,
            unit: 'glasses',
            color: '#38f9d7',
            progress: currentWaterIntake / dailyWaterGoal,
            icon: '💧',
            subtitle: `${Math.max(0, dailyWaterGoal - currentWaterIntake)} glasses left`
        },
        {
            title: 'Steps',
            value: '8.4k',
            maxValue: 10000,
            unit: 'steps',
            color: '#ffeaa7',
            progress: 8400 / 10000, // 84%
            icon: '👟',
            subtitle: '1.6k remaining'
        },
    ];

    useEffect(() => {
        if (!isAuthenticated) router.replace('/auth/authpage')
    }, [isAuthenticated]);

    useEffect(() => {
        if (user?.id) {
            loadTodayData();
        }
    }, [user?.id]);

    const loadTodayData = async () => {
        await Promise.all([
            loadTodayNutritionSummary(),
            loadTodayWaterIntake()
        ]);
    };

    const loadTodayNutritionSummary = async () => {
        try {
            setLoadingNutrition(true);
            const response = await NutritionApiService.getTodayNutritionSummary(user!.id);
            setNutritionSummary(response);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load nutrition data';
            console.error('Failed to load nutrition summary:', errorMessage);
            // Set null on error - we'll handle this in the charts data
            setNutritionSummary(null);
        } finally {
            setLoadingNutrition(false);
        }
    };

    const loadTodayWaterIntake = async () => {
        try {
            setLoadingWater(true);
            const response = await NutritionApiService.getTodayWaterIntake(user!.id);
            setCurrentWaterIntake(Number(response.glassesConsumed) || 0);
        } catch (error) {
            console.error('Failed to load water intake:', error);
        } finally {
            setLoadingWater(false);
        }
    };

    const handleLogWater = async (glasses: number) => {
        try {
            const response = await NutritionApiService.logWaterIntake(user!.id, glasses);

            // Update local state with the total from backend
            setCurrentWaterIntake(Number(response.totalToday) || 0);

            console.log(`Successfully logged ${glasses} glasses. Total today: ${response.totalToday}`);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to log water';
            console.error('Failed to log water:', errorMessage);
            // You can show an error toast/alert here
        }
    };

    const currTime = new Date().getHours();
    const currDate = new Date();
    const getGreeting = (currTime: number) => {
        if (currTime > 3 && currTime < 11) return 'Good Morning'
        else if (currTime > 12 && currTime < 17) return 'Good Afternoon'
        else return 'Good Evening'
    }

    if (!fontsLoaded) {
        return null;
    } else {
        return (
            <>
                <View style={styles.container}>
                    {/** Greeting section */}
                    <View style={styles.greetingContainer}>
                        <Text style={styles.greeting}>{getGreeting(currTime)}</Text>
                        <Text style={styles.username}>{user?.username}</Text>
                    </View>
                    {/** Date Section */}
                    <View style={styles.dateContainer}>
                        <Text style={styles.date}>{format(currDate, 'EEEE, MMM d yyyy')}</Text>
                    </View>
                    {/** Carousel Section */}
                    <View style={styles.progressContainer}>
                        <HorizontalScrollContainer
                            title="Today's Progress"
                            data={chartsData}
                            renderItem={(chart, index) => (
                                <ChartCard
                                    title={chart.title}
                                    value={
                                        (loadingNutrition && ['Calories', 'Protein', 'Carbs', 'Fat'].includes(chart.title)) ||
                                            (loadingWater && chart.title === 'Water')
                                            ? '...'
                                            : chart.value
                                    }
                                    maxValue={chart.maxValue}
                                    unit={chart.unit}
                                    color={chart.color}
                                    progress={chart.progress}
                                    icon={chart.icon}
                                    subtitle={chart.subtitle}
                                />
                            )}
                            itemWidth={70}
                            itemSpacing={4}
                            activeDotColor="#667eea"
                        />
                    </View>
                    {/** Quick Action Section */}
                    <View style={styles.quickActionContainer}>
                        <HorizontalScrollContainer
                            title="Quick Actions"
                            data={quickActionsData}
                            renderItem={(action, index) => (
                                <QuickActionCard
                                    title={action.title}
                                    color={action.color}
                                    subtitle={action.subtitle}
                                    icon={action.icon}
                                    onPress={action.onPress}
                                />
                            )}
                            itemWidth={70}
                            itemSpacing={4}
                            activeDotColor="#667eea"
                        />
                    </View>
                </View>
                <WaterLogModal
                    visible={showWaterModal}
                    onClose={() => setShowWaterModal(false)}
                    currentIntake={currentWaterIntake}
                    dailyGoal={dailyWaterGoal}
                    onLogWater={handleLogWater}
                />
            </>

        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: wp(5)
    },
    greetingContainer: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginBottom: hp(1),
    },
    greeting: {
        fontFamily: 'Pacifico_400Regular',
        fontSize: rf(32)
    },
    username: {
        fontSize: rf(24),
        fontFamily: 'OpenSans_400Regular',
    },
    dateContainer: {
    },
    date: {
        fontSize: rf(24),
        fontWeight: 'bold',
        color: '#333'
    },
    dataContainer: {
        maxHeight: hp(22),
    },
    progressContainer: {
    },
    quickActionContainer: {

    }
});

export default HomePage;