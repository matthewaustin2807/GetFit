import { Alert, Dimensions, PixelRatio, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import DailyNutritionSummary from '@/src/components/mealLogging/mealLoggingComponents/dailyNutritionSummary';
import IndividualMealContainer from '@/src/components/mealLogging/mealLoggingComponents/individualMealContainer';
import { useDate } from '@/src/context/dateContext';
import { NutritionApiService } from '@/src/services/nutrition/nutritionApi';
import { Meal, NutritionSummary, UserMealSummary } from '@/src/types/nutrition';
import { useAuthStore } from '@/src/store/authStore';
import { router } from 'expo-router';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

const MealLoggingPage = () => {
    const { selectedDate, setSelectedDate, displayDate } = useDate();
    const { user, isAuthenticated } = useAuthStore();
    const [meals, setMeals] = useState<UserMealSummary | null>(null);
    const [nutritionSummary, setNutritionSummary] = useState<NutritionSummary | null>(null);
    const [mealMap, setMealMap] = useState<Map<String, Meal[]>>(new Map<String, Meal[]>([
        ['BREAKFAST', []],
        ['LUNCH', []],
        ['DINNER', []],
        ['SNACK', []],
        ['OTHER', []]
    ]));

    useEffect(() => {
        if (!isAuthenticated) router.replace('/auth/authpage')
    }, [isAuthenticated]);

    useEffect(() => {
        const getMealsAndSummary = async () => {
            try {
                const mealResponse = await NutritionApiService.getMealsByDate(user!.id, selectedDate.toISOString().split('T')[0])
                setMeals(mealResponse)

                const summaryResponse = await NutritionApiService.getNutritionSummaryByDate(user!.id, selectedDate.toISOString().split('T')[0])
                setNutritionSummary(summaryResponse);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
                Alert.alert('Error', errorMessage);
            }
        }
        getMealsAndSummary();
    }, [selectedDate])

    useEffect(() => {
        const currMap = new Map<String, Meal[]>([
            ['BREAKFAST', []],
            ['LUNCH', []],
            ['DINNER', []],
            ['SNACK', []],
            ['OTHER', []]
        ])
        if (meals && meals.mealCount! > 0) {
            meals.meals.forEach((item) => {
                currMap.get(item.mealType)?.push(item)
            })
        }
        setMealMap(currMap)
    }, [meals])

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
        <ScrollView style={styles.container}>
            <DailyNutritionSummary nutritionSummary={nutritionSummary} />
            <View>
                {mealTimes.map((item, index) => (
                    <IndividualMealContainer key={item.type} text={item.text} type={item.type} meals={mealMap.get(item.type) ?? []} />
                ))}
            </View>
        </ScrollView>
    )
}

export default MealLoggingPage

const styles = StyleSheet.create({
    container: {
        paddingBottom: hp(5),
    },

})