import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PixelRatio,
} from 'react-native';
import { router, usePathname } from 'expo-router';

const { width } = Dimensions.get('window');
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * Dimensions.get('window').height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface SmartHeaderProps {
  title: string;
  onMenuPress: () => void;
  rightComponent?: React.ReactElement;
  backgroundColor?: string;
}

export const SmartHeader: React.FC<SmartHeaderProps> = ({
  title,
  onMenuPress,
  rightComponent,
  backgroundColor = '#fff',
}) => {
  const pathname = usePathname();

  // Define which routes are "main pages" (show hamburger)
  const mainPages = [
    '/dashboard/homepage',
    '/nutrition',
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

  return (
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

      {/* Right Component (optional) */}
      <View style={styles.rightSection}>
        {rightComponent || <View style={styles.headerSpacer} />}
      </View>
    </View>
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
});