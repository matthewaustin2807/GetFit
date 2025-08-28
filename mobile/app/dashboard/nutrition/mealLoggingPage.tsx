import { Alert, Dimensions, PixelRatio, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import DailyNutritionSummary from '@/src/components/mealLogging/mealLoggingComponents/dailyNutritionSummary';
import IndividualMealContainer from '@/src/components/mealLogging/mealLoggingComponents/individualMealContainer';
import { useDate } from '@/src/context/dateContext';
import { NutritionApiService } from '@/src/services/nutrition/nutritionApi';
import { UserMealSummary } from '@/src/types/nutrition';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

const MealLoggingPage = () => {
    const { selectedDate, setSelectedDate, displayDate } = useDate();
    const [meals, setMeals] = useState<UserMealSummary | null>(null);

    useEffect(() => {
        const getMeals = async () => {
            try {
                const response = await NutritionApiService.getMealsByDate(3, selectedDate.toISOString().split('T')[0])
                setMeals(response)
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to log meal';
                Alert.alert('Error', errorMessage);
            }
        }
        getMeals();
    }, [selectedDate])

    const mealTimes = [
        {
            text: 'Breakfast',
            type: 'BREAKFAST'
        },
        {
            text: 'Lunch',
            type: 'LUNCH'
        },
        {
            text: 'Dinner',
            type: 'DINNER'
        },
        {
            text: 'Snack',
            type: 'SNACK'
        },
        {
            text: 'Other',
            type: 'OTHER'
        }
    ]

    return (
        <ScrollView>
            <DailyNutritionSummary />
            <View>
                {mealTimes.map((item, index) => (
                    <IndividualMealContainer key={item.type} text={item.text} type={item.type} />
                ))}
            </View>
        </ScrollView>
    )
}

export default MealLoggingPage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderColor: 'black',
        borderWidth: 1,
    },

})