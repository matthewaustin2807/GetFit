import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  PixelRatio,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';

const { width, height } = Dimensions.get('window');
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

const DRAWER_WIDTH = wp(75); // 75% of screen width

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose }) => {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const [isVisible, setIsVisible] = useState(false);

  const { user, logout, isLoading } = useAuthStore();

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Slide in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [isOpen]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
            // Close drawer immediately to prevent state updates during unmount
            onClose();
            
            // Small delay to let drawer close animation complete
            setTimeout(async () => {
              try {
                await logout();
                // Navigation will be handled by the auth redirect in _layout or index
              } catch (error) {
                console.error('Logout failed:', error);
                // Force navigation even if logout fails
                router.replace('/auth/authpage');
              }
            }, 300);
            
          } catch (error) {
            console.error('Logout error:', error);
            router.replace('/auth/authpage');
          }
          },
        },
      ]
    );
  };

    const handleProfile = () => {
      onClose();
      router.push('/dashboard/profile/profilepage');
    };

  //   const handleSettings = () => {
  //     onClose();
  //     router.push('/settings');
  //   };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Overlay */}
      <Animated.View
        style={[styles.overlay, { opacity: opacityAnim }]}
      >
        <TouchableOpacity
          style={styles.overlayTouch}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.username || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuText}>My Profile</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={styles.menuText}>Logout</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.menuItem} >
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>Settings</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity> */}

          {/* <TouchableOpacity style={styles.menuItem} onPress={() => {
            onClose();
            Alert.alert('Coming Soon', 'Goals feature coming soon!');
          }}>
            <Text style={styles.menuIcon}>🎯</Text>
            <Text style={styles.menuText}>Goals</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {
            onClose();
            Alert.alert('Coming Soon', 'Help & Support coming soon!');
          }}>
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={styles.menuText}>Help & Support</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity> */}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  overlayTouch: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    backgroundColor: '#4a5568',
    paddingTop: hp(8),
    paddingBottom: hp(3),
    paddingHorizontal: wp(5),
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  avatarText: {
    fontSize: rf(20),
    fontWeight: 'bold',
    color: '#4a5568',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: rf(18),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: hp(0.5),
  },
  userEmail: {
    fontSize: rf(14),
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuSection: {
    flex: 1,
    paddingTop: hp(2),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    fontSize: rf(20),
    marginRight: wp(4),
  },
  menuText: {
    flex: 1,
    fontSize: rf(16),
    color: '#333',
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: rf(18),
    color: '#666',
  },
  footer: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(5),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: rf(18),
    marginRight: wp(2),
  },
  logoutText: {
    fontSize: rf(16),
    color: '#fff',
    fontWeight: 'bold',
  },
});