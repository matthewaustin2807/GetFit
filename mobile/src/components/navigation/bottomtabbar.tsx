import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PixelRatio,
  Platform,
  Alert,
} from 'react-native';
import { router, usePathname } from 'expo-router';

const { width } = Dimensions.get('window');
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * Dimensions.get('window').height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface TabItem {
  route: string;
  label: string;
  icon: string;
  activeIcon?: string; // Optional different icon when active
}

interface BottomTabBarProps {
  variant?: 'default' | 'floating'; // Different styles
  backgroundColor?: string;
  activeColor?: string;
  inactiveColor?: string;
  showLabels?: boolean;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  variant = 'default',
  backgroundColor = '#fff',
  activeColor = '#667eea',
  inactiveColor = '#999',
  showLabels = true,
}) => {
  const pathname = usePathname();

  // Define your app's main tabs
  const tabs: TabItem[] = [
    {
      route: '/dashboard/homepage',
      label: 'Home',
      icon: '🏠',
      activeIcon: '🏠', // Could be different if you want
    },
    {
      route: '/nutrition',
      label: 'Nutrition',
      icon: '🍎',
      activeIcon: '🍎',
    },
    // {
    //   route: '/workouts',
    //   label: 'Workouts',
    //   icon: '💪',
    //   activeIcon: '💪',
    // },
    // {
    //   route: '/progress',
    //   label: 'Progress',
    //   icon: '📊',
    //   activeIcon: '📊',
    // },
    {
      route: '/dashboard/profile/profilepage',
      label: 'Profile',
      icon: '👤',
      activeIcon: '👤',
    },
  ];

  const handleTabPress = (route: string) => {
    if (route === '/nutrition') {
      Alert.alert('Not yet implemented')
    } else {
      if (pathname !== route) {
        router.push(route as any);
      }
    }

  };

  const isTabActive = (route: string) => {
    // Handle nested routes (e.g., /nutrition/log-meal should highlight nutrition tab)
    return pathname === route || pathname.startsWith(route + '/');
  };

  return (
    <View style={[
      variant === 'floating' ? styles.floatingContainer : styles.defaultContainer,
      { backgroundColor }
    ]}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const isActive = isTabActive(tab.route);
          const iconToShow = isActive && tab.activeIcon ? tab.activeIcon : tab.icon;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.tab,
                isActive && styles.activeTab,
              ]}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
            >
              {/* Icon with active indicator */}
              <View style={[
                styles.iconContainer,
                isActive && { backgroundColor: `${activeColor}15` }
              ]}>
                <Text style={[
                  styles.icon,
                  { color: isActive ? activeColor : inactiveColor }
                ]}>
                  {iconToShow}
                </Text>
              </View>

              {/* Label */}
              {showLabels && (
                <Text style={[
                  styles.label,
                  { color: isActive ? activeColor : inactiveColor }
                ]}>
                  {tab.label}
                </Text>
              )}

            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  defaultContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? hp(4) : hp(2), // Safe area for iOS
  },
  floatingContainer: {
    position: 'absolute',
    bottom: hp(3),
    left: wp(5),
    right: wp(5),
    borderRadius: wp(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: hp(1.5),
    paddingBottom: hp(1),
    paddingHorizontal: wp(2),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1),
    position: 'relative',
  },
  activeTab: {
    // Additional styling for active tab if needed
  },
  iconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  icon: {
    fontSize: rf(20),
  },
  label: {
    fontSize: rf(11),
    fontWeight: '500',
    textAlign: 'center',
  },
});