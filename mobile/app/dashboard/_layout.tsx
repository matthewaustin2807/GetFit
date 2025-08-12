import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, PixelRatio } from 'react-native';
import { Slot, Stack } from 'expo-router';
import { BottomTabBar } from '@/src/components/navigation/bottomtabbar';
import { SideDrawer } from '@/src/components/navigation/sidebar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SmartHeader } from '@/src/components/navigation/smartheader';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

export default function DashboardLayout() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);
    
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.container}>
                <SmartHeader
                    title="Get Fit"
                    onMenuPress={() => setIsDrawerOpen(true)}
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
}

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