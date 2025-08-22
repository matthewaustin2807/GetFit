import { Dimensions, PixelRatio, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Icon } from '@rneui/base';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

interface FoodDetails {
    name: string,
    calories: string,
}

interface IndividualFoodOptionProps {
    item: FoodDetails
}

const IndividualFoodOption: React.FC<IndividualFoodOptionProps> = ({
    item
}) => {
    return (
        <View style={styles.individualHistoryContainer}>
            <View style={styles.foodContainer}>
                <Text style={styles.foodNameText}>{item.name}</Text>
                <Text style={styles.foodDescriptionText}>{`${item.calories} cal`}</Text>
            </View>
            <Icon
                name="add-circle-outline"
                type="ionicon"
                onPress={() => { console.log('pressed') }}
                style={styles.addIcon}
                size={rf(32)}
            />
        </View>
    )
}

export default IndividualFoodOption

const styles = StyleSheet.create({
    individualHistoryContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: hp(0.5),
    paddingHorizontal: wp(2),
    backgroundColor: '#FFFFFF',
    minHeight: hp(8),
    borderRadius: 12,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  foodContainer:{
    marginLeft: wp(1),
  },
  foodNameText:{
    fontSize: rf(16),
    fontWeight: '600',
    marginBottom: hp(0.5)
  },
  foodDescriptionText: {
    fontSize: rf(12),
    fontWeight: '300'
  },
  addIcon: {
  }
})