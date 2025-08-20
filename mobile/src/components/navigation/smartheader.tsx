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
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  displayDate?: string
}

export const SmartHeader: React.FC<SmartHeaderProps> = ({
  title,
  onMenuPress,
  rightComponent,
  backgroundColor = '#fff',
  showDatePicker = false,
  selectedDate = new Date(),
  onDateChange,
  displayDate,
}) => {
  const pathname = usePathname();
  const [showPicker, setShowPicker] = useState(false);
  const {goToNextDay, goToPreviousDay} = useDate();

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

          ) : (
            <></>
          )}
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
    minWidth: wp(10), // Ensures title stays centered
  },
  headerSpacer: {
    width: wp(10),
  },
  centerSection: {
    flex: 1,
    alignItems:'center'
  },
  datePickerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems:'center',
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
});