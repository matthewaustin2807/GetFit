import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  PixelRatio,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

const { width } = Dimensions.get('window');
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * Dimensions.get('window').height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface HorizontalScrollContainerProps<T> {
  title?: string;
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  itemWidth?: number; // Card width as percentage of screen
  itemSpacing?: number; // Spacing between cards as percentage
  showDots?: boolean;
  showTitle?: boolean;
  dotColor?: string;
  activeDotColor?: string;
  snapToInterval?: boolean;
  onItemChange?: (index: number, item: T) => void;
}

export function HorizontalScrollContainer<T>({
  title = "Section Title",
  data,
  renderItem,
  itemWidth = 70, // Default 70% of screen width
  itemSpacing = 4, // Default 4% spacing
  showDots = true,
  showTitle = true,
  dotColor = '#ddd',
  activeDotColor = '#667eea',
  snapToInterval = true,
  onItemChange,
}: HorizontalScrollContainerProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const cardWidth = wp(itemWidth);
  const spacing = wp(itemSpacing);
  const snapInterval = cardWidth + spacing;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollX / snapInterval);
    const clampedIndex = Math.max(0, Math.min(currentIndex, data.length - 1));

    if (clampedIndex !== activeIndex) {
      setActiveIndex(clampedIndex);
      onItemChange?.(clampedIndex, data[clampedIndex]);
    }
  };

  const handleDotPress = (index: number) => {
    const scrollToX = index * snapInterval;

    scrollViewRef.current?.scrollTo({
      x: scrollToX,
      animated: true,
    });

    setActiveIndex(index);
    onItemChange?.(index, data[index]);
  };

  return (
    <View style={styles.container}>
      {/* Section Title */}
      {showTitle && (
        <Text style={styles.sectionTitle}>{title}</Text>
      )}

      {/* Horizontal Scroll Container */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
        ]}
        decelerationRate="fast"
        snapToAlignment="start"
        snapToInterval={snapToInterval ? snapInterval : undefined}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {data.map((item, index) => (
          <View
            key={index}
            style={[
              styles.itemContainer,
              {
                width: cardWidth,
                marginRight: index === data.length - 1 ? wp(5) : spacing,
              },
            ]}
          >
            {renderItem(item, index)}
          </View>
        ))}
      </ScrollView>

      {/* Dynamic Scroll Indicator Dots */}
      {showDots && data.length > 1 && (
        <View style={styles.dotsContainer}>
          {data.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dotTouchable}
              onPress={() => handleDotPress(index)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === activeIndex ? activeDotColor : dotColor,
                    transform: [{ scale: index === activeIndex ? 1.2 : 1 }],
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    
    marginVertical: hp(1),
  },
  sectionTitle: {
    fontSize: rf(18),
    fontWeight: '600',
    color: '#333',
    marginBottom: hp(2),
  },
  itemContainer: {
    // Container for each item - sizing handled by props
  },
  scrollContent: {
    paddingLeft: wp(1),
    paddingRight: wp(1), // Less padding on right for better scroll feel
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(1),
  },
  dotTouchable: {
    padding: wp(2), // Larger touch area
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#ddd',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#667eea',
  },
  dotIcon: {
    fontSize: rf(10),
    lineHeight: rf(12),
  },
});