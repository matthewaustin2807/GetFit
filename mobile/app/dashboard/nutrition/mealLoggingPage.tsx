import { Alert, Dimensions, PixelRatio, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
import DailyNutritionSummary from '@/src/components/mealLogging/dailyNutritionSummary';
import IndividualMealContainer from '@/src/components/mealLogging/individualMealContainer';
import { useDate } from '@/src/context/dateContext';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

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

const MealLoggingPage = () => {
    const { selectedDate, setSelectedDate, displayDate } = useDate();

    useEffect(() => {

    }, [selectedDate, displayDate])

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