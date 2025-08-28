import { Alert, Dimensions, PixelRatio, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { router } from 'expo-router';
import { useMealType } from '@/src/context/mealTypeContext';

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
    const {selectedMealType, setSelectedMealType} = useMealType();
    
    const handleAddFoodPress = () => {
        // Convert your meal types to lowercase for consistency
        const mealTypeMapping: { [key: string]: string } = {
            'BREAKFAST': 'breakfast',
            'LUNCH': 'lunch',
            'DINNER': 'dinner',
            'SNACK': 'snack',
            'OTHER': 'others'
        };

        setSelectedMealType(mealTypeMapping[type])

        // Navigate with meal type as parameter
        router.push({
            pathname: '/dashboard/nutrition/mealSearchPage',
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
        backgroundColor: '#FFFFFF',
        paddingVertical: hp(1),
        marginHorizontal: wp(3),
        marginBottom: hp(1),
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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