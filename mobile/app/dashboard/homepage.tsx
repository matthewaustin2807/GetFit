import { useAuthStore } from '@/src/store/authStore';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from "react-native";

const HomePage = () => {
    const {logout, isAuthenticated} = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) router.replace('/auth/authpage')
    }, [isAuthenticated]);

    const handleLogout = async () => {
        await logout();
    }

    return (
        <View>
            <Text>
                Homepage
            </Text>
            <TouchableOpacity onPress={handleLogout}>
                <Text>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

export default HomePage;