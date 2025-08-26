import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PixelRatio,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useDate } from '@/src/context/dateContext';

const { width } = Dimensions.get('window');
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * Dimensions.get('window').height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface SmartHeaderProps {
  title: string;
  onMenuPress: () => void;
  rightComponent?: React.ReactElement;
  backgroundColor?: string;
  showDatePicker?: boolean;
  showMealPicker?: boolean;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  displayDate?: string
  selectedMealType?: string;
  onMealTypeChange?: (mealType: string) => void;
}

export const SmartHeader: React.FC<SmartHeaderProps> = ({
  title,
  onMenuPress,
  rightComponent,
  backgroundColor = '#fff',
  showDatePicker = false,
  showMealPicker = false,
  selectedDate = new Date(),
  onDateChange,
  displayDate,
  selectedMealType,
  onMealTypeChange
}) => {
  const pathname = usePathname();
  const [showPicker, setShowPicker] = useState(false)
  const [showMealDropdown, setShowMealDropdown] = useState(false);
  const { goToNextDay, goToPreviousDay } = useDate();

  // NEW: Meal types
  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'others', label: 'Others' },
  ];

  const getCurrentMealType = () => {
    return mealTypes.find(meal => meal.value === selectedMealType) || mealTypes[0];
  };

  const handleMealTypeSelect = (mealType: string) => {
    if (onMealTypeChange) {
      onMealTypeChange(mealType);
    }
    setShowMealDropdown(false);
  };

  // Define which routes are "main pages" (show hamburger)
  const mainPages = [
    '/dashboard/homepage',
    '/dashboard/nutrition/mealLoggingPage',
    '/dashboard/profile/profilepage',
  ];

  // Check if current page is a main page
  const isMainPage = mainPages.includes(pathname);

  // Check if we can go back (for back button pages)
  const canGoBack = !isMainPage && router.canGoBack();

  const handleLeftButtonPress = () => {
    if (isMainPage) {
      // Show hamburger menu
      onMenuPress();
    } else if (canGoBack) {
      // Go back to previous page
      router.back();
    }
  };

  const handleDatePress = () => {
    if (showDatePicker && onDateChange) {
      setShowPicker(true);
    }
  };

  const hideDatePicker = () => {
    setShowPicker(false)
  };

  const handleConfirm = (date: Date) => {
    if (onDateChange) {
      onDateChange(date)
    }
    hideDatePicker();
  };

  return (
    <>
      <View style={[styles.header]}>
        {/* Left Button - Hamburger or Back */}
        <TouchableOpacity
          style={styles.leftButton}
          onPress={handleLeftButtonPress}
        >
          {isMainPage ? (
            // Hamburger Menu
            <Text style={styles.hamburger}>☰</Text>
          ) : (
            // Back Button
            <Text style={styles.backButton}>←</Text>
          )}
        </TouchableOpacity>

        <View style={styles.centerSection}>
          {showDatePicker ? (
            <View style={styles.datePickerContainer}>
              <TouchableOpacity onPress={goToPreviousDay}>
                <Text>❮</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.datePicker}
                onPress={handleDatePress}
              >
                <Text style={styles.dateText}>{displayDate}</Text>
                <Text style={[styles.dateIcon]}>🔽</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={goToNextDay}>
                <Text>❯</Text>
              </TouchableOpacity>
            </View>
          ) : showMealPicker ? (
            // Simple meal picker dropdown
            <View style={styles.mealPickerContainer}>
              <TouchableOpacity
                style={styles.mealPicker}
                onPress={() => setShowMealDropdown(!showMealDropdown)}
              >
                <Text style={styles.mealText}>
                  {selectedMealType!.charAt(0).toUpperCase() + selectedMealType!.slice(1)}
                </Text>
                <Text style={styles.dropdownIcon}>🔽</Text>
              </TouchableOpacity>

              {showMealDropdown && (
                <View style={styles.mealDropdown}>
                  {['breakfast', 'lunch', 'dinner', 'snack', 'others'].map((meal) => (
                    <TouchableOpacity
                      key={meal}
                      style={styles.mealOption}
                      onPress={() => {
                        onMealTypeChange?.(meal);
                        setShowMealDropdown(false);
                      }}
                    >
                      <Text style={styles.mealOptionText}>
                        {meal.charAt(0).toUpperCase() + meal.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <></>
          )
          }
        </View>

        {/* Right Component (optional) */}
        <View style={styles.rightSection}>
          {rightComponent || <View style={styles.headerSpacer} />}
        </View>
      </View>
      {showPicker && onDateChange && <DateTimePickerModal
        isVisible={showPicker}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        date={selectedDate}
      >
      </DateTimePickerModal>}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    minHeight: hp(5),
  },
  leftButton: {
    padding: wp(2),
    marginRight: wp(3),
  },
  hamburger: {
    fontSize: rf(32),
    color: '#4a5568',
  },
  backButton: {
    fontSize: rf(32),
    color: '#4a5568',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: rf(20),
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  rightSection: {
    minWidth: wp(8),
    alignItems: 'flex-end',
  },
  headerSpacer: {
    width: wp(10),
    marginLeft: wp(-3),
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  datePickerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    maxHeight: hp(5)
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
  },
  dateText: {
    fontSize: rf(16),
    fontWeight: '600',
    color: '#333',
    marginRight: wp(2),
  },
  dateIcon: {
    fontSize: rf(16),
  },
  mealPickerContainer: {
    minWidth: wp(32),
  },
  mealPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    backgroundColor: 'transparent',
  },
  mealText: {
    fontSize: rf(16),
    fontWeight: '600',
    color: '#333',
    marginRight: wp(2),
  },
  dropdownIcon: {
    fontSize: rf(12),
    color: '#666',
  },
  mealDropdown: {
    position: 'absolute',
    top: hp(6),
    left: 0,
    right: 0,
    minWidth: wp(24),
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    marginHorizontal: wp(2),
  },
  mealOption: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mealOptionText: {
    fontSize: rf(16),
    color: '#333',
  },
  selectedMealOption: {
    backgroundColor: '#e3f2fd',
  },
  selectedMealOptionText: {
    color: '#1976d2',
    fontWeight: '600',
  },
});