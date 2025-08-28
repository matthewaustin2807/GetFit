import { Alert, Dimensions, PixelRatio, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Icon } from '@rneui/base';
import { FoodItem } from '@/src/types/nutrition';
import { router } from 'expo-router';
import { NutritionApiService } from '@/src/services/nutrition/nutritionApi';
import { useMealType } from '@/src/context/mealTypeContext';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface IndividualFoodOptionProps {
    item: FoodItem
}

const IndividualFoodOption: React.FC<IndividualFoodOptionProps> = ({
    item
}) => {
    const { selectedMealType } = useMealType(); 

    const goToFoodDetail = () => {
        router.push({
            pathname: '/dashboard/nutrition/foodDetailPage',
            params: {
                foodData: JSON.stringify(item),
            }
        });
    };

    const logFood = async () => {
        try {
            const logRequest = {
                userId: 3,
                foodId: item.id!,
                quantityGrams: 100, // Convert servings to grams
                mealType: selectedMealType.toUpperCase() as 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER',
                notes: '' // Optional
            };

            const result = await NutritionApiService.logMeal(logRequest);

            // Show success message or navigate back
            Alert.alert('Success', 'Meal logged successfully!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to log meal';
            Alert.alert('Error', errorMessage);
        }
    }

    return (
        <TouchableOpacity
            style={styles.individualHistoryContainer}
            onPress={goToFoodDetail}>
            <View style={styles.foodContainer}>
                <Text style={styles.foodNameText}>{item.name}</Text>
                {item.brand && <Text style={styles.foodBrandText}>{item.brand}</Text>}
            </View>
            <Icon
                name="add-circle-outline"
                type="ionicon"
                onPress={logFood}
                style={styles.addIcon}
                size={rf(32)}
                color='#4a5568'
            />
        </TouchableOpacity>
    )
}

export default IndividualFoodOption

const styles = StyleSheet.create({
    individualHistoryContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: hp(0.5),
        paddingHorizontal: wp(2),
        backgroundColor: '#FFFFFF',
        minHeight: hp(8),
        borderRadius: 12,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    foodContainer: {
        marginLeft: wp(1),
        maxWidth: wp(72),
        paddingVertical: hp(1),
    },
    foodNameText: {
        fontSize: rf(16),
        fontWeight: '600',
        marginBottom: hp(0.5),
        color: '#111827'
    },
    foodBrandText: {
        fontSize: rf(12),
        fontWeight: '300',
        marginBottom: hp(0.5),
        color: '#111827'
    },
    foodDescriptionText: {
        fontSize: rf(12),
        fontWeight: '300'
    },
    addIcon: {
        paddingRight: wp(2),
    }
})