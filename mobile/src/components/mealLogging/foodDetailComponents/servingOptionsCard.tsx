import { Dimensions, Modal, PixelRatio, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { useMealType } from '@/src/context/mealTypeContext';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface ServingOptionsCardProps {
    onServingChange: (servings: number) => void;
}

const ServingOptionsCard: React.FC<ServingOptionsCardProps> = ({
    onServingChange
}) => {
    const { selectedMealType, setSelectedMealType } = useMealType();
    const [showMealDropdown, setShowMealDropdown] = useState(false);
    const [mealTypeInputLayout, setMealTypeInputLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [servings, setServings] = useState('1');
    const buttonRef = useRef<any>(null);

    const measureButtonPosition = () => {
        buttonRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
            setMealTypeInputLayout({ x, y, width, height });
        });
    };


    const handleServingChange = (text: string) => {
        setServings(text);
        const numericValue = parseFloat(text) || 1;
        onServingChange(numericValue);
    };

    return (
        <View style={styles.servingOptionContainer}>
            <View style={styles.servingOption}>
                <Text style={styles.servingOptionText}>Serving Size</Text>
                <Text style={styles.servingSizeText}>100g</Text>
            </View>
            <View style={styles.servingOption}>
                <Text style={styles.servingOptionText}>Number of Servings</Text>
                <TextInput
                    style={styles.servingOptionInput}
                    inputMode='decimal'
                    keyboardType='decimal-pad'
                    defaultValue='1'
                    textAlign='right'
                    onChangeText={handleServingChange}
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
    )
}

export default ServingOptionsCard

const styles = StyleSheet.create({
    servingOptionContainer: {
        paddingHorizontal: wp(4),
        marginTop: hp(2),
        minHeight: hp(5),
        overflow: 'visible',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginHorizontal: wp(4),
        marginVertical: hp(1),
        paddingTop: hp(2)
    },
    servingOption: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(2),
    },
    servingOptionText: {
        fontSize: rf(14),
        color: '#6b7280'
    },
    servingSizeText: {
        fontSize: rf(16),
        fontWeight: '500',
        color: '#374151'
    },
    servingOptionInput: {
        borderWidth: 1,
        borderColor: '#374151',
        minWidth: wp(24),
        height: hp(4),
        borderRadius: wp(2),
        paddingRight: wp(2),
        fontWeight: '600'
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
        color: '#374151',
        fontWeight: '600'
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