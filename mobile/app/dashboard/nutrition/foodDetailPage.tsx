import { Alert, Dimensions, Modal, PixelRatio, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { Icon } from '@rneui/base'
import { useMealType } from '@/src/context/mealTypeContext';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

const mockFood = {
    id: 1,
    name: 'Apple',
    brand: 'fuji',
    barcode: '1234',
    nutrition: {
        calories: 20,
        protein: 20,
        carbs: 20,
        fat: 20,
        fiber: 20,
        sugar: 20,
        sodium: 1220,
        unit: '100g'
    },
    hasNutrition: true,
    nutriscore_grade: 'A'
}

const FoodDetailPage = () => {
    const { selectedMealType, setSelectedMealType } = useMealType();
    const [showMealDropdown, setShowMealDropdown] = useState(false);
    const [mealTypeInputLayout, setMealTypeInputLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const buttonRef = useRef<any>(null);

    const measureButtonPosition = () => {
        buttonRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
            setMealTypeInputLayout({ x, y, width, height });
        });
    };

    return (
        <ScrollView>
            <View style={styles.foodNameContainer}>
                <Text style={styles.foodNameText}>{mockFood.name}</Text>
                <TouchableOpacity style={styles.addFoodButton}>
                    <Icon
                        name='checkmark-circle-outline'
                        type='ionicon'
                        size={32}
                        color={'lightblue'}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.servingOptionContainer}>
                <View style={styles.servingOption}>
                    <Text style={styles.servingOptionText}>Serving Size</Text>
                    <TextInput
                        style={styles.servingOptionInput}
                        inputMode='decimal'
                        keyboardType='decimal-pad'
                        defaultValue='1'
                        textAlign='right'
                    />
                </View>
                <View style={styles.servingOption}>
                    <Text style={styles.servingOptionText}>Number of Servings</Text>
                    <TextInput
                        style={styles.servingOptionInput}
                        inputMode='decimal'
                        keyboardType='decimal-pad'
                        defaultValue='1'
                        textAlign='right'
                    />
                </View>
                <View style={styles.servingOption}>
                    <Text style={styles.servingOptionText}>Meal</Text>
                    <View style={styles.mealPickerContainer}>
                        <TouchableOpacity
                            ref={buttonRef}
                            style={styles.servingOptionInput}
                            onPress={() => {
                                measureButtonPosition();
                                setShowMealDropdown(!showMealDropdown)
                            }}
                        >
                            <Text style={styles.mealText}>
                                {selectedMealType!.charAt(0).toUpperCase() + selectedMealType!.slice(1)}
                            </Text>
                        </TouchableOpacity>

                        {showMealDropdown && (
                            <Modal
                                visible={showMealDropdown}
                                transparent={true}
                                animationType="none"
                                onRequestClose={() => setShowMealDropdown(false)}
                            >
                                <TouchableOpacity
                                    style={styles.modalOverlay}
                                    activeOpacity={1}
                                    onPress={() => setShowMealDropdown(false)}
                                >
                                    <View style={styles.modalContent}>
                                        <View style={[styles.modalDropdown,
                                        {
                                            position: 'absolute',
                                            top: mealTypeInputLayout.y - mealTypeInputLayout.height + hp(8.5), // 8px below button
                                            left: mealTypeInputLayout.x,
                                            width: mealTypeInputLayout.width, // Slightly wider than button
                                        }
                                        ]}>
                                            {['breakfast', 'lunch', 'dinner', 'snack', 'others'].map((meal) => (
                                                <TouchableOpacity
                                                    key={meal}
                                                    style={styles.modalOption}
                                                    onPress={() => {
                                                        setSelectedMealType?.(meal);
                                                        setShowMealDropdown(false);
                                                    }}
                                                >
                                                    <Text style={styles.modalOptionText}>
                                                        {meal.charAt(0).toUpperCase() + meal.slice(1)}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Modal>
                        )}
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

export default FoodDetailPage

const styles = StyleSheet.create({
    foodNameContainer: {
        paddingHorizontal: wp(3),
        paddingVertical: wp(3),
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    foodNameText: {
        fontSize: rf(24),
        fontWeight: '500',
        paddingLeft: wp(2),
    },
    addFoodButton: {
        paddingRight: wp(2),
    },
    servingOptionContainer: {
        paddingHorizontal: wp(4),
        marginTop: hp(2),
        minHeight: hp(5),
        overflow: 'visible'
    },
    servingOption: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(2),
        overflow: 'visible'
    },
    servingOptionText: {
        fontSize: rf(14),
        fontWeight: '300',
    },
    servingOptionInput: {
        borderWidth: 1,
        borderColor: 'black',
        minWidth: wp(24),
        height: hp(4),
        borderRadius: wp(2),
        paddingRight: wp(2),
    },
    mealPickerContainer: {
        minWidth: wp(24),
    },
    mealPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        backgroundColor: 'transparent',
    },
    mealText: {
        paddingTop: hp(.85),
        fontSize: rf(14),
        textAlign: 'right',
        color: '#333',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-start',
    },
    modalContent: {
        alignItems: 'center',
        paddingHorizontal: wp(10),
    },
    modalDropdown: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: wp(40),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalOption: {
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalOptionText: {
        fontSize: rf(14),
        color: '#333',
        textAlign: 'right'
    },
})