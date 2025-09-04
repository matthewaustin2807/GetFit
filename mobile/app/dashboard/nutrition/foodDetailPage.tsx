import { Alert, Dimensions, Modal, PixelRatio, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { Icon } from '@rneui/base'
import { useMealType } from '@/src/context/mealTypeContext';
import { User } from '@/src/store/authStore';
import NutritionImpactCard from '@/src/components/mealLogging/foodDetailComponents/nutritionImpactCard';
import { FoodItem } from '@/src/types/nutrition';
import { router, useLocalSearchParams } from 'expo-router';
import ServingOptionsCard from '@/src/components/mealLogging/foodDetailComponents/servingOptionsCard';
import MacroDetailsContainer from '@/src/components/mealLogging/foodDetailComponents/macroDetailsContainer';
import { NutritionApiService } from '@/src/services/nutrition/nutritionApi';
import { useDate } from '@/src/context/dateContext';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

const mockUser: User = {
    id: 1,
    username: 'a',
    email: 'a',
    dailyCalories: 1770,
    dailyCarbs: 225,
    dailyFat: 56,
    dailyProtein: 120,
}

interface FoodDetailPageProps {
    user?: User
}

const FoodDetailPage: React.FC<FoodDetailPageProps> = ({
    user
}) => {
    const { foodData } = useLocalSearchParams();
    const { selectedMealType } = useMealType();
    const { selectedDate } = useDate();
    const [numberOfServings, setNumberOfServings] = useState(1);

    const handleServingChange = (servings: number) => {
        setNumberOfServings(servings);
    };

    // Parse the serialized food data
    const food: FoodItem = JSON.parse(foodData as string);

    const logFood = async () => {
        try {
            const logRequest = {
                userId: 3,
                foodId: food.id!,
                quantityGrams: 100 * numberOfServings, // Convert servings to grams
                mealType: selectedMealType.toUpperCase() as 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER',
                date: selectedDate.toISOString().split('T')[0],
                notes: '' // Optional
            };

            const result = await NutritionApiService.logMeal(logRequest);

            // Show success message or navigate back
            Alert.alert('Success', 'Meal logged successfully!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to log meal';
            Alert.alert('Error', errorMessage);
        } finally {
            router.replace('/dashboard/nutrition/mealLoggingPage');
        }
    }

    return (
        <ScrollView>
            <View style={styles.foodNameContainer}>
                <View style={styles.nameAndBrandContainer}>
                    <Text style={styles.foodNameText}>{food.name}</Text>
                    <Text style={styles.foodBrandText}>{food.brand}</Text>
                </View>
                <TouchableOpacity
                    style={styles.addFoodButton}
                    onPress={logFood}>
                    <Icon
                        name='add-circle-outline'
                        type='ionicon'
                        size={36}
                        color={'#4a5568'}
                    />
                </TouchableOpacity>
            </View>
            <ServingOptionsCard onServingChange={handleServingChange} />
            <MacroDetailsContainer food={food} />
            <View style={styles.dailyGoalsContainer}>
                <NutritionImpactCard foodNutrition={food.nutrition!} userGoals={mockUser} servingSize={numberOfServings} />
            </View>
        </ScrollView>
    )
}

export default FoodDetailPage

const styles = StyleSheet.create({
    foodNameContainer: {
        paddingHorizontal: wp(4),
        paddingTop: wp(3),
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    nameAndBrandContainer: {
        marginLeft: wp(2),
        maxWidth: wp(59),
    },
    foodNameText: {
        fontSize: rf(24),
        fontWeight: '600',
        color: '#111827',
        marginBottom: hp(1),
    },
    foodBrandText: {
        fontSize: rf(16),
        fontWeight: '300',
        color: '#111827'
    },
    addFoodButton: {
        paddingRight: wp(2),
    },

    dailyGoalsContainer: {
    }
})