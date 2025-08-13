import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  PixelRatio,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';
import { ApiService } from '@/src/services/api/authApi';


const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface GoalData {
  currentWeight: string;
  targetWeight: string;
  dailyCalories: string;
  dailyProtein: string;
  dailyCarbs: string;
  dailyFat: string;
  dailyWater: string;
  weeklyWorkouts: string;
  activityLevel: string;
  fitnessGoal: string;
}

const EditGoalPage = () => {
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [goals, setGoals] = useState<GoalData>({
    currentWeight: '',
    targetWeight: '',
    dailyCalories: '',
    dailyProtein: '',
    dailyCarbs: '',
    dailyFat: '',
    dailyWater: '8',
    weeklyWorkouts: '3',
    activityLevel: '',
    fitnessGoal: '',
  });

  // Options for dropdowns
  const [options, setOptions] = useState({
    activityLevels: [],
    fitnessGoals: [],
  });

  const getWeightChangeText = useCallback(() => {
    const current = parseFloat(goals.currentWeight) || 0;
    const target = parseFloat(goals.targetWeight) || 0;
    const difference = current - target;

    if (difference === 0) return 'Maintain current weight';
    if (difference > 0) return `Lose ${difference.toFixed(1)} kg`;
    return `Gain ${Math.abs(difference).toFixed(1)} kg`;
  }, [goals.currentWeight, goals.targetWeight]); // Only recreate when these change

  const getWeightChangeColor = useCallback(() => {
    const current = parseFloat(goals.currentWeight) || 0;
    const target = parseFloat(goals.targetWeight) || 0;
    const difference = current - target;

    if (difference === 0) return '#28a745';
    if (difference > 0) return '#dc3545';
    return '#007bff';
  }, [goals.currentWeight, goals.targetWeight]);

  // Initialize with user data
  // useEffect(() => {
  //   loadUserData();
  //   loadOptions();
  // }, []);

  // const loadUserData = () => {
  //   if (user) {
  //     setGoals({
  //       currentWeight: user.currentWeightKg?.toString() || '',
  //       targetWeight: user.targetWeightKg?.toString() || '',
  //       dailyCalories: calculateDailyCalories().toString(),
  //       dailyProtein: calculateDailyProtein().toString(),
  //       dailyCarbs: calculateDailyCarbs().toString(),
  //       dailyFat: calculateDailyFat().toString(),
  //       dailyWater: '8', // Default
  //       weeklyWorkouts: '3', // Default
  //       activityLevel: user.activityLevel || '',
  //       fitnessGoal: user.fitnessGoal || '',
  //     });
  //   }
  // };

  // const loadOptions = async () => {
  //   try {
  //     const response = await ApiService.authenticatedFetch('/api/users/options');
  //     const data = await response.json();
  //     setOptions(data.options);
  //   } catch (error) {
  //     console.error('Failed to load options:', error);
  //   }
  // };

  // Calculate recommended daily values based on user profile
  // const calculateDailyCalories = () => {
  //   if (!user?.currentWeightKg || !user?.heightCm || !user?.dateOfBirth) return 2000;

  //   // Basic BMR calculation (Mifflin-St Jeor Equation)
  //   const age = new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
  //   const weight = user.currentWeightKg;
  //   const height = user.heightCm;

  //   let bmr;
  //   if (user.gender === 'MALE') {
  //     bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  //   } else {
  //     bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  //   }

  //   // Activity level multiplier
  //   const activityMultipliers = {
  //     SEDENTARY: 1.2,
  //     LIGHTLY_ACTIVE: 1.375,
  //     MODERATELY_ACTIVE: 1.55,
  //     VERY_ACTIVE: 1.725,
  //     EXTREMELY_ACTIVE: 1.9,
  //   };

  //   const multiplier = activityMultipliers[user.activityLevel as keyof typeof activityMultipliers] || 1.2;
  //   return Math.round(bmr * multiplier);
  // };

  // const calculateDailyProtein = () => {
  //   if (!user?.currentWeightKg) return 120;
  //   return Math.round(user.currentWeightKg * 1.6); // 1.6g per kg body weight
  // };

  // const calculateDailyCarbs = () => {
  //   const calories = calculateDailyCalories();
  //   return Math.round((calories * 0.45) / 4); // 45% of calories from carbs
  // };

  // const calculateDailyFat = () => {
  //   const calories = calculateDailyCalories();
  //   return Math.round((calories * 0.25) / 9); // 25% of calories from fat
  // };

  //  const handleSave = async () => {
  //   if (!user) return;

  //   setIsSaving(true);
  //   try {
  //     // Validate required fields
  //     if (!goals.currentWeight || !goals.targetWeight) {
  //       Alert.alert('Error', 'Current weight and target weight are required');
  //       return;
  //     }

  //     // Prepare data for API
  //     const updateData = {
  //       currentWeightKg: parseFloat(goals.currentWeight),
  //       targetWeightKg: parseFloat(goals.targetWeight),
  //       activityLevel: goals.activityLevel,
  //       fitnessGoal: goals.fitnessGoal,
  //     };

  //     // Update user profile via API
  //     const response = await ApiService.updateUserProfile(user.id, updateData);

  //     if (response.user) {
  //       // Update local user state
  //       updateUser(response.user);

  //       Alert.alert(
  //         'Success!', 
  //         'Your goals have been updated successfully',
  //         [
  //           {
  //             text: 'OK',
  //             onPress: () => router.back(),
  //           },
  //         ]
  //       );
  //     }

  //   } catch (error: any) {
  //     Alert.alert('Error', error.message || 'Failed to update goals');
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  // const handleRecalculate = () => {
  //   setGoals(prev => ({
  //     ...prev,
  //     dailyCalories: calculateDailyCalories().toString(),
  //     dailyProtein: calculateDailyProtein().toString(),
  //     dailyCarbs: calculateDailyCarbs().toString(),
  //     dailyFat: calculateDailyFat().toString(),
  //   }));
  //   Alert.alert('Recalculated', 'Daily nutrition goals updated based on your profile');
  // };

  const updateGoal = (field: keyof GoalData, value: string) => {
    setGoals(prev => ({ ...prev, [field]: value }));
  };

  const renderPicker = (
    title: string,
    value: string,
    options: string[],
    onSelect: (value: string) => void
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pickerContainer}
      >
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.pickerOption,
              value === option && styles.pickerOptionActive,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text style={[
              styles.pickerOptionText,
              value === option && styles.pickerOptionTextActive,
            ]}>
              {option.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Your Fitness Goals</Text>
            <Text style={styles.pageSubtitle}>
              Customize your targets to match your fitness journey
            </Text>
          </View>

          {/* Weight Goals Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Weight Goals</Text>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Current Weight</Text>
                <TextInput
                  style={styles.input}
                  value={goals.currentWeight}
                  onChangeText={(value) => updateGoal('currentWeight', value)}
                  placeholder="70"
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>kg</Text>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Target Weight</Text>
                <TextInput
                  style={styles.input}
                  value={goals.targetWeight}
                  onChangeText={(value) => updateGoal('targetWeight', value)}
                  placeholder="65"
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>kg</Text>
              </View>
            </View>
          </View>

          {/* Daily Nutrition Goals */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🍎 Daily Nutrition</Text>
              <TouchableOpacity
                style={styles.recalculateButton}
              // onPress={handleRecalculate}
              >
                <Text style={styles.recalculateText}>Auto-Calculate</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Calories</Text>
                <TextInput
                  style={styles.input}
                  value={goals.dailyCalories}
                  onChangeText={(value) => updateGoal('dailyCalories', value)}
                  placeholder="2000"
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>cal</Text>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Protein</Text>
                <TextInput
                  style={styles.input}
                  value={goals.dailyProtein}
                  onChangeText={(value) => updateGoal('dailyProtein', value)}
                  placeholder="120"
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>g</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Carbs</Text>
                <TextInput
                  style={styles.input}
                  value={goals.dailyCarbs}
                  onChangeText={(value) => updateGoal('dailyCarbs', value)}
                  placeholder="250"
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>g</Text>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Fat</Text>
                <TextInput
                  style={styles.input}
                  value={goals.dailyFat}
                  onChangeText={(value) => updateGoal('dailyFat', value)}
                  placeholder="65"
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>g</Text>
              </View>
            </View>
          </View>

          {/* Activity Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💪 Activity Goals</Text>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Water Intake</Text>
                <TextInput
                  style={styles.input}
                  value={goals.dailyWater}
                  onChangeText={(value) => updateGoal('dailyWater', value)}
                  placeholder="8"
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>glasses</Text>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Weekly Workouts</Text>
                <TextInput
                  style={styles.input}
                  value={goals.weeklyWorkouts}
                  onChangeText={(value) => updateGoal('weeklyWorkouts', value)}
                  placeholder="3"
                  keyboardType="numeric"
                />
                <Text style={styles.unit}>days</Text>
              </View>
            </View>
          </View>

          {/* Fitness Profile */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Fitness Profile</Text>

            {/* Activity Level Picker */}
            {renderPicker(
              'Activity Level',
              goals.activityLevel,
              options.activityLevels,
              (value) => updateGoal('activityLevel', value)
            )}

            {/* Fitness Goal Picker */}
            {renderPicker(
              'Primary Goal',
              goals.fitnessGoal,
              options.fitnessGoals,
              (value) => updateGoal('fitnessGoal', value)
            )}
          </View>

          {/* Goal Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Weight Change Needed:</Text>
                <Text style={[
                  styles.summaryValue,
                  { color: getWeightChangeColor() }
                ]}>
                  {getWeightChangeText()}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Daily Calorie Goal:</Text>
                <Text style={styles.summaryValue}>{goals.dailyCalories} cal</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Weekly Activity:</Text>
                <Text style={styles.summaryValue}>{goals.weeklyWorkouts} workouts</Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.buttonDisabled]}
            // onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Goals</Text>
            )}
          </TouchableOpacity>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </>
  );
}

export default EditGoalPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  header: {
    marginBottom: hp(3),
  },
  pageTitle: {
    fontSize: rf(24),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: hp(1),
  },
  pageSubtitle: {
    fontSize: rf(14),
    color: '#666',
    textAlign: 'center',
    lineHeight: rf(20),
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(4),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: rf(18),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp(2),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(3),
  },
  halfInput: {
    flex: 1,
    position: 'relative',
  },
  inputGroup: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: rf(14),
    fontWeight: '500',
    color: '#333',
    marginBottom: hp(1),
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.5),
    fontSize: rf(16),
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingRight: wp(10), // Space for unit text
  },
  unit: {
    position: 'absolute',
    right: wp(3),
    top: hp(4), // Adjust based on label height
    fontSize: rf(14),
    color: '#666',
    fontWeight: '500',
  },
  pickerContainer: {
    paddingVertical: hp(1),
  },
  pickerOption: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(6),
    marginRight: wp(2),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  pickerOptionActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  pickerOptionText: {
    fontSize: rf(14),
    color: '#666',
    fontWeight: '500',
  },
  pickerOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  recalculateButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(2),
  },
  recalculateText: {
    fontSize: rf(12),
    color: '#fff',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: wp(2),
    padding: wp(3),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(0.8),
  },
  summaryLabel: {
    fontSize: rf(14),
    color: '#666',
    flex: 1,
  },
  summaryValue: {
    fontSize: rf(14),
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#667eea',
    borderRadius: wp(3),
    paddingVertical: hp(2),
    alignItems: 'center',
    marginTop: hp(3),
    marginHorizontal: wp(2),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: rf(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  bottomSpacing: {
    height: hp(5), // Extra space for bottom tab bar
  },
});