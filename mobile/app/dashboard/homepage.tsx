import { useAuthStore } from '@/src/store/authStore';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { Dimensions, PixelRatio, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SideDrawer } from '@/src/components/sidebar';
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
                {/** Date section */}
                <View>
                    <Text>8/8/2025</Text>
                </View>
                {/** Carousel Section */}
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
        backgroundColor: '#f5f5f5',
    },
    menuButton: {
        padding: wp(2),
    },
    hamburger: {
        fontSize: rf(24),
        color: '#4a5568',
    },
});

export default HomePage;