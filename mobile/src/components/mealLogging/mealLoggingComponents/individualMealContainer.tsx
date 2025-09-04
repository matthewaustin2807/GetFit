import { Alert, Dimensions, PixelRatio, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { router } from 'expo-router';
import { useMealType } from '@/src/context/mealTypeContext';
import { Meal } from '@/src/types/nutrition';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface IndividualMealContainerProps {
    text: string,
    type: string,
    meals: Meal[]
}

const IndividualMealContainer: React.FC<IndividualMealContainerProps> = ({
    text,
    type,
    meals
}) => {
    const { selectedMealType, setSelectedMealType } = useMealType();

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
            {meals && meals.length > 0 && (
                <View style={styles.mealsListContainer}>
                    {meals.map((meal, index) => (
                        <View key={index} style={styles.mealItem}>
                            <Text style={styles.mealItemText}>
                                {meal.food?.name || 'Unknown Food'} - {meal.quantityGrams}g
                            </Text>
                            <Text style={styles.mealItemNutrition}>
                                {meal.nutrition?.calories} cal
                            </Text>
                        </View>
                    ))}
                </View>
            )}
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
        fontWeight: '700',
        color: '#4a5568',
        paddingHorizontal: wp(3),
    },
    mealsListContainer: {
        marginHorizontal: wp(3),
        marginBottom: hp(0.5),
    },
    mealItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: hp(1),
    },
    mealItemText: {
        fontSize: rf(14),
        color: '#374151',
        flex: 1,
        fontWeight: '300',
        maxWidth: wp(65),
    },
    mealItemNutrition: {
        fontSize: rf(12),
        color: '#6b7280',
        fontWeight: '300'
    },
})