import { Dimensions, PixelRatio, StyleSheet, Text, View } from 'react-native'
import React from 'react'

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

const DailyNutritionSummary = () => {
    return (
        <View
            style={styles.nutritionContainer}
        >
            <Text style={styles.nutritionTitle}>Nutrients Today</Text>
            <View
                style={styles.macronutrientsContainer}
            >
                <View style={styles.individualNutritionContainer}>
                    <Text style={styles.nutritionValueText}>292</Text>
                    <Text style={styles.nutritionLabelText}>Carbs (g)</Text>
                </View>
                <View style={styles.individualNutritionContainer}>
                    <Text style={styles.nutritionValueText}>292</Text>
                    <Text style={styles.nutritionLabelText}>Fat (g)</Text>
                </View>
                <View style={styles.individualNutritionContainer}>
                    <Text style={styles.nutritionValueText}>292</Text>
                    <Text style={styles.nutritionLabelText}>Protein (g)</Text>
                </View>
                <View style={styles.individualNutritionContainer}>
                    <Text style={styles.nutritionValueText}>292</Text>
                    <Text style={styles.nutritionLabelText}>Calories (g)</Text>
                </View>
            </View>
        </View>
    )
}

export default DailyNutritionSummary

const styles = StyleSheet.create({
    nutritionContainer: {
        paddingHorizontal: wp(3),
        marginVertical: hp(1),
    },
    nutritionTitle: {
        fontSize: rf(24),
        fontWeight: '500',
    },
    macronutrientsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingVertical: hp(1),
    },
    individualNutritionContainer: {
        flex: 1,
        alignItems: 'center',
    },
    nutritionValueText: {
        fontSize: rf(18),
        fontWeight: '300'
    },
    nutritionLabelText: {
        fontSize: rf(14),
        fontWeight: '500',
        color: '#333'
    }
})