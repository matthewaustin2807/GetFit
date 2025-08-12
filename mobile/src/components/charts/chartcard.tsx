import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    PixelRatio,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * Dimensions.get('window').height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface ChartCardProps {
    title: string;
    value: string | number;
    maxValue?: number;
    unit?: string;
    color: string;
    progress?: number; // 0-1 for progress circle
    icon?: string;
    subtitle?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
    title,
    value,
    maxValue,
    unit,
    color,
    progress = 0,
    icon,
    subtitle,
}) => {
    const radius = 45;
    const circumference = 2 * Math.PI * 45; // Circle radius = 45
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress * circumference);
    const circleSize = wp(25);

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
            </View>

            {/* Progress Circle */}
            <View style={styles.chartContainer}>
                <View style={[styles.circleContainer, { width: circleSize, height: circleSize }]}>
                    {/* SVG Circle */}
                    <Svg
                        width={circleSize}
                        height={circleSize}
                        viewBox="0 0 100 100"
                        style={styles.svgCircle}
                    >
                        {/* Background Circle */}
                        <Circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke="#f0f0f0"
                            strokeWidth="6"
                        />

                        {/* Progress Circle */}
                        <Circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke={color}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 50 50)"
                        />
                    </Svg>

                    {/* Absolutely Centered Content */}
                    <View style={styles.absoluteCenter}>
                        {icon && <Text style={styles.centerIcon}>{icon}</Text>}
                        <Text style={[styles.value, { color }]}>{value}</Text>
                        {unit && <Text style={[styles.unit, { color }]}>{unit}</Text>}
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                {maxValue && (
                    <Text style={styles.maxValue}>
                        Goal: {maxValue} {unit}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: wp(70),
        backgroundColor: '#fff',
        borderRadius: wp(4),
        padding: wp(4),
        marginRight: wp(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        alignItems: 'center',
        marginBottom: hp(2),
    },
    title: {
        fontSize: rf(16),
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(2),
    },
    circleContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    svgCircle: {
        position: 'absolute',
    },
    absoluteCenter: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [
            { translateX: -wp(12.5) }, // Half of circleSize
            { translateY: -wp(12.5) }, // Half of circleSize
        ],
        width: wp(25),
        height: wp(25),
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerIcon: {
        fontSize: rf(18),
        marginBottom: 2,
        textAlign: 'center',
    },
    value: {
        fontSize: rf(16),
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: rf(18),
    },
    unit: {
        fontSize: rf(10),
        color: '#666',
        textAlign: 'center',
        lineHeight: rf(12),
    },
    footer: {
        alignItems: 'center',
    },
    subtitle: {
        fontSize: rf(12),
        color: '#666',
        marginBottom: 4,
        textAlign: 'center',
    },
    maxValue: {
        fontSize: rf(11),
        color: '#999',
        marginBottom: 4,
        textAlign: 'center',
    },
    percentage: {
        fontSize: rf(14),
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default ChartCard;