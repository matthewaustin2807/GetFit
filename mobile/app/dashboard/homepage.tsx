import ChartCard from '@/src/components/charts/chartcard';
import QuickActionCard from '@/src/components/quickaction/quickactioncard';
import { HorizontalScrollContainer } from '@/src/components/horizontalscrollview';
import { SideDrawer } from '@/src/components/navigation/sidebar';
import { useAuthStore } from '@/src/store/authStore';
import { OpenSans_400Regular } from '@expo-google-fonts/open-sans';
import { Pacifico_400Regular, useFonts } from '@expo-google-fonts/pacifico';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { format } from "date-fns";
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, PixelRatio, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

const Drawer = createDrawerNavigator();

const HomePage = () => {
    const { logout, isAuthenticated } = useAuthStore();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);
    // useEffect(() => {
    //     if (!isAuthenticated) router.replace('/auth/authpage')
    // }, [isAuthenticated]);

    let [fontsLoaded] = useFonts({
        Pacifico_400Regular,
        OpenSans_400Regular,
    });
    const quickActionsData = [
        {
            title: 'Log Food',
            icon: '📷',
            subtitle: 'Log your food intake',
            color: 'pink'
        },
        {
            title: 'Log Food',
            icon: '📷',
            subtitle: 'Log your food intake',
            color: 'pink'
        },
        {
            title: 'Log Food',
            icon: '📷',
            subtitle: 'Log your food intake',
            color: 'pink'
        },
    ];

    const chartsData = [
        {
            title: 'Calories',
            value: 1847,
            maxValue: 2200,
            unit: 'cal',
            color: '#667eea',
            progress: 1847 / 2200, // 84%
            icon: '🔥',
            subtitle: '353 remaining'
        },
        {
            title: 'Protein',
            value: 127,
            maxValue: 150,
            unit: 'g',
            color: '#f093fb',
            progress: 127 / 150, // 85%
            icon: '🥩',
            subtitle: '23g remaining'
        },
        {
            title: 'Carbs',
            value: 189,
            maxValue: 275,
            unit: 'g',
            color: '#4facfe',
            progress: 189 / 275, // 69%
            icon: '🍞',
            subtitle: '86g remaining'
        },
        {
            title: 'Fat',
            value: 68,
            maxValue: 97,
            unit: 'g',
            color: '#43e97b',
            progress: 68 / 97, // 70%
            icon: '🥑',
            subtitle: '29g remaining'
        },
        {
            title: 'Water',
            value: 6,
            maxValue: 8,
            unit: 'glasses',
            color: '#38f9d7',
            progress: 6 / 8, // 75%
            icon: '💧',
            subtitle: '2 glasses left'
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
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={styles.container}>
                    {/** Header containing sidebar and greeting */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
                            <Text style={styles.hamburger}>☰</Text>
                        </TouchableOpacity>
                    </View>
                    {/** Greeting section */}
                    <View style={styles.greetingContainer}>
                        <Text style={styles.greeting}>{getGreeting(currTime)}</Text>
                        <Text style={styles.username}>Test User</Text>
                    </View>
                    {/** Date Section */}
                    <View style={styles.dateContainer}>
                        <Text style={styles.date}>{format(currDate, 'EEEE MMM, d yyyy')}</Text>
                    </View>
                    {/** Carousel Section */}
                    <View>
                        <HorizontalScrollContainer
                            title="Today's Progress"
                            data={chartsData}
                            renderItem={(chart, index) => (
                                <ChartCard
                                    title={chart.title}
                                    value={chart.value}
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
                    <View>
                        <HorizontalScrollContainer
                            title="Quick Actions"
                            data={quickActionsData}
                            renderItem={(action, index) => (
                                <QuickActionCard
                                    title={action.title}
                                    color={action.color}
                                    subtitle={action.subtitle}
                                    icon={action.icon}
                                />
                            )}
                            itemWidth={70}
                            itemSpacing={4}
                            activeDotColor="#667eea"
                        />
                    </View>
                    <SideDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
                </SafeAreaView>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp(1),
        backgroundColor: '#f5f5f5',
    },
    menuButton: {
        paddingTop: wp(2),
    },
    hamburger: {
        fontSize: rf(36),
        color: '#4a5568',
    },
    greetingContainer: {
        flex: 1,
        maxHeight: hp(11),
        flexDirection: 'column',
        alignItems: 'flex-end'
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
        flex: 1,
        maxHeight: hp(4),
    },
    date: {
        fontSize: rf(24),
        fontWeight: 'bold',
        color: '#333'
    },
    dataContainer: {
        maxHeight: hp(22),
    }
});

export default HomePage;