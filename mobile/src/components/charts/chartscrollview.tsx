import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    PixelRatio,
    NativeSyntheticEvent,
    NativeScrollEvent,
    TouchableOpacity,
} from 'react-native';
import ChartCard from './chartcard';

const { width } = Dimensions.get('window');
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * Dimensions.get('window').height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface ChartsScrollViewProps {
    title?: string;
}

export const ChartsScrollView: React.FC<ChartsScrollViewProps> = ({
    title = "Today's Overview"
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    // Mock data - replace with real data from your stores later
    const chartsData = [
        {
            title: 'Calories',
            value: 1847,
            maxValue: 2200,
            unit: 'cal',
            color: '#667eea',
            progress: 1847 / 2200, // 84%
            icon: '🔥',
            subtitle: '353 remaining'
        },
        {
            title: 'Protein',
            value: 127,
            maxValue: 150,
            unit: 'g',
            color: '#f093fb',
            progress: 127 / 150, // 85%
            icon: '🥩',
            subtitle: '23g remaining'
        },
        {
            title: 'Carbs',
            value: 189,
            maxValue: 275,
            unit: 'g',
            color: '#4facfe',
            progress: 189 / 275, // 69%
            icon: '🍞',
            subtitle: '86g remaining'
        },
        {
            title: 'Fat',
            value: 68,
            maxValue: 97,
            unit: 'g',
            color: '#43e97b',
            progress: 68 / 97, // 70%
            icon: '🥑',
            subtitle: '29g remaining'
        },
        {
            title: 'Water',
            value: 6,
            maxValue: 8,
            unit: 'glasses',
            color: '#38f9d7',
            progress: 6 / 8, // 75%
            icon: '💧',
            subtitle: '2 glasses left'
        },
        {
            title: 'Steps',
            value: '8.4k',
            maxValue: 10000,
            unit: 'steps',
            color: '#ffeaa7',
            progress: 8400 / 10000, // 84%
            icon: '👟',
            subtitle: '1.6k remaining'
        },
    ];

    // Calculate which card is currently in view
    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollX = event.nativeEvent.contentOffset.x;
        const cardWidth = wp(70) + wp(4); // Card width + margin
        const currentIndex = Math.round(scrollX / cardWidth);

        // Make sure index is within bounds
        const clampedIndex = Math.max(0, Math.min(currentIndex, chartsData.length - 1));

        if (clampedIndex !== activeIndex) {
            setActiveIndex(clampedIndex);
        }
    };

    // Handle dot press to scroll to specific card
    const handleDotPress = (index: number) => {
        const cardWidth = wp(70) + wp(4);
        const scrollToX = index * cardWidth;

        scrollViewRef.current?.scrollTo({
            x: scrollToX,
            animated: true,
        });

        setActiveIndex(index);
    };

    return (
        <View style={styles.container}>
            {/* Section Title */}
            <Text style={styles.sectionTitle}>{title}</Text>

            {/* Horizontal Scroll Container */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                decelerationRate="fast"
                snapToAlignment="start"
                snapToInterval={wp(74)} // Card width + margin for snap effect
                onScroll={handleScroll}
                scrollEventThrottle={16} // Smooth scroll tracking
            >
                {chartsData.map((chart, index) => (
                    <ChartCard
                        key={index}
                        title={chart.title}
                        value={chart.value}
                        maxValue={chart.maxValue}
                        unit={chart.unit}
                        color={chart.color}
                        progress={chart.progress}
                        icon={chart.icon}
                        subtitle={chart.subtitle}
                    />
                ))}
            </ScrollView>

            {/* Dynamic Scroll Indicator Dots */}
            <View style={styles.dotsContainer}>
                {chartsData.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.dot,
                            index === activeIndex && styles.activeDot,
                        ]}
                        onPress={() => handleDotPress(index)}
                        activeOpacity={0.7}
                    >
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

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
    scrollContent: {
        paddingLeft: wp(2),
        paddingRight: wp(1), // Less padding on right for better scroll feel
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: hp(2),
    },
    dot: {
        width: 6,
        height: 6,
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