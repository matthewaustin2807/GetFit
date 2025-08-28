import { Dimensions, PixelRatio, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { FoodItem } from '@/src/types/nutrition';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface MacroDetailsContainerProps {
    food: FoodItem
}

const MacroDetailsContainer: React.FC<MacroDetailsContainerProps> = ({
    food
}) => {
    return (
        <View style={styles.macroContainer}>
            <View style={styles.calorieContainer}>
                <Text style={styles.macroValueText}>{food.nutrition!.calories}</Text>
                <Text style={styles.macroLabelText}>cal</Text>
            </View>
            <View style={styles.CFPContainer}>
                <Text style={styles.macroValueText}>{food.nutrition!.carbs}g</Text>
                <Text style={styles.macroLabelText}>Carbs</Text>
            </View>
            <View style={styles.CFPContainer}>
                <Text style={styles.macroValueText}>{food.nutrition!.fat}g</Text>
                <Text style={styles.macroLabelText}>Fat</Text>
            </View>
            <View style={styles.CFPContainer}>
                <Text style={styles.macroValueText}>{food.nutrition!.protein}g</Text>
                <Text style={styles.macroLabelText}>Protein</Text>
            </View>
        </View>
    )
}

export default MacroDetailsContainer

const styles = StyleSheet.create({
    macroContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp(3),
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginHorizontal: wp(4),
        marginVertical: hp(1),
    },
    calorieContainer: {
        borderWidth: 3,
        borderColor: '#4a5568',
        minWidth: wp(20),
        minHeight: wp(20),
        borderRadius: 180,
        justifyContent: 'center',
        alignItems: 'center'
    },
    macroValueText: {
        fontSize: rf(14),
        fontWeight: '600',
        color: '#111827',
    },
    macroLabelText: {
        fontSize: rf(14),
        fontWeight: '500',
        color: '#374151',
    },
    CFPContainer: {
        minWidth: wp(18),
        minHeight: wp(18),
        justifyContent: 'center',
        alignItems: 'center'
    },
})