import { User } from '@/src/store/authStore';
import { Nutrition } from '@/src/types/nutrition';
import React from 'react';
import { View, Text, StyleSheet, Dimensions, PixelRatio } from 'react-native';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface NutritionProgressBarProps {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  color?: string;
  showPercentage?: boolean;
}

interface NutritionImpactCardProps {
  foodNutrition: Nutrition;
  userGoals: User;
  servingSize?: number;
}

interface MacroData {
  label: string;
  current?: number;
  goal?: number;
  unit: string;
  color: string;
}

const NutritionProgressBar: React.FC<NutritionProgressBarProps> = ({ 
  label, 
  current, 
  goal, 
  unit = 'g',
  color = '#3b82f6',
  showPercentage = true 
}) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const isOverGoal = current > goal;
  
  return (
    <View style={styles.progressContainer}>
      {/* Header with label and values */}
      <View style={styles.progressHeader}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.valuesContainer}>
          <Text style={[styles.currentValue, isOverGoal && styles.overGoalText]}>
            {current.toFixed(1)}{unit}
          </Text>
          <Text style={styles.separator}>/</Text>
          <Text style={styles.goalValue}>
            {goal.toFixed(0)}{unit}
          </Text>
          {showPercentage && (
            <Text style={[styles.percentage, isOverGoal && styles.overGoalText]}>
              ({percentage.toFixed(0)}%)
            </Text>
          )}
        </View>
      </View>
      
      {/* Progress bar track */}
      <View style={styles.progressTrack}>
        <View 
          style={[
            styles.progressFill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: isOverGoal ? '#ef4444' : color
            }
          ]} 
        />
      </View>
    </View>
  );
};

const NutritionImpactCard: React.FC<NutritionImpactCardProps> = ({ 
  foodNutrition, 
  userGoals, 
  servingSize = 100 
}) => {
  // Calculate nutrition for the specific serving size
  const calculateForServing = (per100g: number): number => (per100g * servingSize);
  
  const macros: MacroData[] = [
    {
      label: 'Calories',
      current: calculateForServing(foodNutrition.calories!),
      goal: userGoals.dailyCalories,
      unit: 'cal',
      color: '#f59e0b'
    },
    {
      label: 'Protein',
      current: calculateForServing(foodNutrition.protein!),
      goal: userGoals.dailyProtein,
      unit: 'g',
      color: '#10b981'
    },
    {
      label: 'Carbs',
      current: calculateForServing(foodNutrition.carbs!),
      goal: userGoals.dailyCarbs,
      unit: 'g',
      color: '#6366f1'
    },
    {
      label: 'Fat',
      current: calculateForServing(foodNutrition.fat!),
      goal: userGoals.dailyFat,
      unit: 'g',
      color: '#ec4899'
    }
  ];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Nutrition Impact</Text>
        <Text style={styles.servingInfo}>{servingSize * 100}g serving</Text>
      </View>
      
      <View style={styles.macrosContainer}>
        {macros.map((macro) => (
          <NutritionProgressBar
            key={macro.label}
            label={macro.label}
            current={macro.current!}
            goal={macro.goal!}
            unit={macro.unit}
            color={macro.color}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: wp(3),
    padding: wp(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: wp(4),
    marginVertical: hp(1),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  cardTitle: {
    fontSize: rf(18),
    fontWeight: '600',
    color: '#111827',
  },
  servingInfo: {
    fontSize: rf(14),
    color: '#6b7280',
  },
  macrosContainer: {
    gap: hp(1.5),
  },
  progressContainer: {
    marginBottom: hp(1),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  label: {
    fontSize: rf(14),
    fontWeight: '500',
    color: '#374151',
    textTransform: 'capitalize',
  },
  valuesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
  },
  currentValue: {
    fontSize: rf(14),
    fontWeight: '600',
    color: '#111827',
  },
  separator: {
    fontSize: rf(14),
    color: '#6b7280',
  },
  goalValue: {
    fontSize: rf(14),
    color: '#6b7280',
  },
  percentage: {
    fontSize: rf(12),
    fontWeight: '500',
    color: '#2563eb',
  },
  overGoalText: {
    color: '#dc2626',
  },
  progressTrack: {
    height: hp(1),
    backgroundColor: '#e5e7eb',
    borderRadius: wp(1),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: wp(1),
  },
});

export default NutritionImpactCard;