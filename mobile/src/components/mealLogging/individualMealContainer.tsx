import { Alert, Dimensions, PixelRatio, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { router } from 'expo-router';

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

    const handleAddFoodPress = () => {
        // Convert your meal types to lowercase for consistency
        const mealTypeMapping: { [key: string]: string } = {
            'BREAKFAST': 'breakfast',
            'LUNCH': 'lunch',
            'DINNER': 'dinner',
            'SNACK': 'snack',
            'OTHER': 'others'
        };

        const selectedType = mealTypeMapping[type] || 'others';

        // Navigate with meal type as parameter
        router.push({
            pathname: '/dashboard/nutrition/mealSearchPage',
            params: { mealType: selectedType }
        });
    };
    
    return (
        <View key={type} style={styles.individualMealContainer}>
            <Text style={styles.mealText}>{text}</Text>
            <TouchableOpacity onPress={handleAddFoodPress}>
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