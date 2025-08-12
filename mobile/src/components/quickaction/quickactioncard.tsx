import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    PixelRatio,
} from 'react-native';

const { width } = Dimensions.get('window');
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * Dimensions.get('window').height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface QuickActionCardProps {
    title: string;
    color: string;
    icon?: string;
    subtitle?: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
    title,
    color,
    icon,
    subtitle
}) => {
    return (
        <View style={styles.card}>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={styles.title}>{title}</Text>
            <Text>{subtitle}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        width: wp(70),
        minHeight: hp(14),
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
    icon: {
        fontSize: rf(18),
    },
    title: {
        fontWeight: '600',
        fontSize: rf(18),
        color: '#333',
        marginVertical: hp(2)
    }
});

export default QuickActionCard;
