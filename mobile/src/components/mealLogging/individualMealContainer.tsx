import { Alert, Dimensions, PixelRatio, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface IndividualMealContainerProps {
    text: string,
    type: string,
}

const IndividualMealContainer: React.FC<IndividualMealContainerProps> = ({
    text,
    type
}) => {
    return (
        <View key={type} style={styles.individualMealContainer}>
            <Text style={styles.mealText}>{text}</Text>
            <TouchableOpacity onPress={() => Alert.alert('pressed')}>
                <Text style={styles.addFoodLink}>Add Food</Text>
            </TouchableOpacity>
        </View>
    )
}

export default IndividualMealContainer

const styles = StyleSheet.create({
    individualMealContainer: {
        marginTop: hp(1),
        borderWidth: 0.25,
        backgroundColor: '#F0F0F0',
        paddingVertical: hp(1),
        marginHorizontal: wp(2),
        marginBottom: hp(1),
        borderRadius: wp(3),
    },
    mealText: {
        fontSize: rf(18),
        fontWeight: '400',
        marginBottom: hp(1),
        paddingHorizontal: wp(3),
    },
    addFoodLink: {
        fontSize: rf(14),
        fontWeight: '500',
        color: '#0062D1',
        paddingHorizontal: wp(3),
    }
})