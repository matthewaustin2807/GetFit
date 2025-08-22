import { Dimensions, PixelRatio, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Icon, SearchBar } from '@rneui/base'
import IndividualFoodOption from '@/src/components/mealLogging/individualFoodOption';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

const mockFoodHistory = [
  {
    name: 'Apple',
    calories: '129',
  },
  {
    name: 'Banana',
    calories: '49',
  },
  {
    name: 'Orange',
    calories: '23',
  }
]

const MealSearchPage = () => {
  const [search, setSearch] = useState('');
  const [searchMode, setSearchMode] = useState(false)

  const handleSubmit = () => {
    console.log('pressed')
  }

  return (
    <ScrollView style={styles.container}>
      <View
      >
        <SearchBar
          lightTheme={true}
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={styles.inputSearchBarContainer}
          placeholder="Search food..."
          onChangeText={setSearch}
          onFocus={() => { setSearchMode(true) }}
          onEndEditing={() => { setSearchMode(false) }}
          value={search}
          round={true}
          onSubmitEditing={handleSubmit}
        />
      </View>
      <View
        style={styles.searchResultsContainer}
      >
        <Text style={styles.searchResultsText}>Search Results</Text>
      </View>
      {/* {searchMode ||
      <View style={styles.searchOptionsContainer}>
        <TouchableOpacity style={styles.searchOptionContainer}>
          <Icon
            name='barcode-outline'
            type='ionicon'
          />
          <Text style={styles.searchOptionText}>Barcode Scan</Text>
        </TouchableOpacity>
      </View>}
      
      <View style={styles.foodHistoryContainer}>
        <Text style={styles.historyText}>History</Text>
        {mockFoodHistory.map((item, index) => (
          <IndividualFoodOption key={item.name} item={item}/>
        ))}
      </View> */}
    </ScrollView>
  )
}

export default MealSearchPage;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(2)
  },
  searchBarContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  inputSearchBarContainer: {
    borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: 'white'
  },
  searchOptionsContainer: {
    marginVertical: hp(1),
    marginHorizontal: wp(1),
    paddingHorizontal: wp(1),
  },
  searchOptionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp(24),
    height: hp(7),
    backgroundColor: '#FFFFFF',
    paddingVertical: hp(1),
    paddingHorizontal: wp(1),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchOptionText: {
    fontSize: rf(12),
  },
  foodHistoryContainer: {
    marginVertical: hp(1),
    marginHorizontal: wp(2),
  },
  historyText: {
    fontSize: rf(20),
    fontWeight: '400',
    marginBottom: hp(1)
  },
  searchResultsContainer: {
    marginVertical: hp(1),
    marginHorizontal: wp(2),
  },
  searchResultsText: {
    fontSize: rf(20),
    fontWeight: '400',
    marginBottom: hp(1)
  }

})