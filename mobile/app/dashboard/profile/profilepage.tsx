import { router } from 'expo-router';
import * as React from 'react';
import { View, Text, StyleSheet, Dimensions, PixelRatio, TouchableOpacity } from 'react-native';
// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

const MyProfilePage = () => {
    return (
        <View style={styles.container}>
            {/** Name Section */}
            <View style={styles.nameSection}>
                <Text style={styles.name}>Test User</Text>
                <View style={styles.emailContainer}>
                    <Text style={styles.email}>testuser@example.com</Text>
                </View>
            </View>
            <View style={styles.separator} />
            {/** Options Sections */}
            <View style={styles.optionSection}>
                <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/dashboard/profile/profilepage/editgoal')}>
                    <Text style={styles.optionIcon}>🎯</Text>
                    <Text style={styles.optionTitle}>Edit Goals</Text>
                    <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    nameSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        maxHeight: hp(18),
    },
    name: {
        fontSize: rf(32),
        fontWeight: '500',
        color: '#333'
    },
    emailContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: hp(2),
        backgroundColor: '#c8e0f1',
        borderRadius: wp(3),
        paddingVertical: hp(2),
        paddingHorizontal: wp(3),
        minWidth: 'auto',
        maxHeight: hp(6),
        width: wp(64),
    },
    email: {
        justifyContent: 'center',
        color: '#5d89a1',
        fontWeight: '600'
    },
    separator: {
        height: 1, // Thickness of the border
        backgroundColor: 'grey', // Color of the border
        marginHorizontal: wp(4)
    },
    optionSection: {
        flex: 1,
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
    },
    optionCard: {
        backgroundColor: '#fff',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
        paddingVertical: hp(1),
        paddingHorizontal: wp(4),
        marginBottom: hp(1),
        maxHeight: hp(7),
        borderRadius: wp(3)
    },
    optionTitle: {
        fontWeight: '600',
        fontSize: rf(14),
        marginLeft: wp(4),
        alignSelf: 'center',

    },
    arrowIcon: {
        alignSelf: 'center',
        marginLeft: 'auto'
    },
    optionIcon: {
        fontSize: rf(18)
    }
});

export default MyProfilePage;