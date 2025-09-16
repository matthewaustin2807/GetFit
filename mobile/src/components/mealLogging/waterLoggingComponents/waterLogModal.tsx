import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import { Icon } from '@rneui/base';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface WaterLogModalProps {
    visible: boolean;
    onClose: () => void;
    currentIntake: number;
    dailyGoal: number;
    onLogWater: (glasses: number) => void;
}

const WaterLogModal: React.FC<WaterLogModalProps> = ({
    visible,
    onClose,
    currentIntake,
    dailyGoal,
    onLogWater
}) => {
    const [selectedAmount, setSelectedAmount] = useState(1);

    const waterOptions = [
        { glasses: 0.5, label: '0.5 glass', icon: '💧' },
        { glasses: 1, label: '1 glass', icon: '🥤' },
        { glasses: 2, label: '2 glasses', icon: '🥃' },
        { glasses: 3, label: '3 glasses', icon: '🍺' },
    ];

    const handleLogWater = () => {
        onLogWater(selectedAmount);
        onClose();
    };

    const progressPercentage = (currentIntake / dailyGoal) * 100;
    const remainingGlasses = Math.max(0, dailyGoal - currentIntake);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Log Water Intake</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="close" type="ionicon" color="#666" size={rf(24)} />
                        </TouchableOpacity>
                    </View>

                    {/* Current Progress */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressInfo}>
                            <Text style={styles.progressText}>
                                {currentIntake} of {dailyGoal} glasses
                            </Text>
                            <Text style={styles.remainingText}>
                                {remainingGlasses} glasses remaining
                            </Text>
                        </View>
                        
                        {/* Progress Bar */}
                        <View style={styles.progressBarContainer}>
                            <View 
                                style={[
                                    styles.progressBar, 
                                    { width: `${Math.min(progressPercentage, 100)}%` }
                                ]} 
                            />
                        </View>
                        <Text style={styles.percentageText}>{Math.round(progressPercentage)}%</Text>
                    </View>

                    {/* Water Amount Selection */}
                    <View style={styles.selectionSection}>
                        <Text style={styles.sectionTitle}>How much did you drink?</Text>
                        
                        <View style={styles.optionsContainer}>
                            {waterOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.glasses}
                                    style={[
                                        styles.optionButton,
                                        selectedAmount === option.glasses && styles.selectedOption
                                    ]}
                                    onPress={() => setSelectedAmount(option.glasses)}
                                >
                                    <Text style={styles.optionIcon}>{option.icon}</Text>
                                    <Text style={[
                                        styles.optionLabel,
                                        selectedAmount === option.glasses && styles.selectedOptionText
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionSection}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.logButton} onPress={handleLogWater}>
                            <Text style={styles.logButtonText}>Log Water</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(5),
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: wp(4),
        paddingVertical: hp(3),
        paddingHorizontal: wp(5),
        width: '100%',
        maxWidth: wp(85),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(3),
    },
    headerTitle: {
        fontSize: rf(20),
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        padding: wp(1),
    },
    progressSection: {
        marginBottom: hp(3),
    },
    progressInfo: {
        alignItems: 'center',
        marginBottom: hp(2),
    },
    progressText: {
        fontSize: rf(18),
        fontWeight: '600',
        color: '#38f9d7',
        marginBottom: hp(0.5),
    },
    remainingText: {
        fontSize: rf(14),
        color: '#666',
    },
    progressBarContainer: {
        height: hp(1),
        backgroundColor: '#e0e0e0',
        borderRadius: hp(0.5),
        marginBottom: hp(1),
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#38f9d7',
        borderRadius: hp(0.5),
    },
    percentageText: {
        fontSize: rf(12),
        color: '#666',
        textAlign: 'center',
    },
    selectionSection: {
        marginBottom: hp(3),
    },
    sectionTitle: {
        fontSize: rf(16),
        fontWeight: '500',
        color: '#333',
        marginBottom: hp(2),
        textAlign: 'center',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    optionButton: {
        width: '48%',
        backgroundColor: '#f5f5f5',
        borderRadius: wp(3),
        paddingVertical: hp(2),
        paddingHorizontal: wp(3),
        alignItems: 'center',
        marginBottom: hp(1.5),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedOption: {
        backgroundColor: '#e6fffe',
        borderColor: '#38f9d7',
    },
    optionIcon: {
        fontSize: rf(24),
        marginBottom: hp(0.5),
    },
    optionLabel: {
        fontSize: rf(14),
        color: '#666',
        textAlign: 'center',
        fontWeight: '500',
    },
    selectedOptionText: {
        color: '#38f9d7',
        fontWeight: '600',
    },
    actionSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: wp(3),
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: wp(3),
        paddingVertical: hp(1.5),
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: rf(16),
        color: '#666',
        fontWeight: '500',
    },
    logButton: {
        flex: 1,
        backgroundColor: '#38f9d7',
        borderRadius: wp(3),
        paddingVertical: hp(1.5),
        alignItems: 'center',
    },
    logButtonText: {
        fontSize: rf(16),
        color: 'white',
        fontWeight: '600',
    },
});

export default WaterLogModal;