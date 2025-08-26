import IndividualFoodOption from '@/src/components/mealLogging/individualFoodOption';
import { useMealType} from '@/src/context/mealTypeContext';
import { NutritionApiService } from '@/src/services/nutrition/nutritionApi';
import { FoodItem, FoodSearchResponse } from '@/src/types/nutrition';
import { Icon, SearchBar } from '@rneui/base';
import React, { useState } from 'react';
import { Dimensions, PixelRatio, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Responsive helper functions
const wp = (percentage: number) => (percentage * width) / 100;
const hp = (percentage: number) => (percentage * height) / 100;
const rf = (size: number) => size * PixelRatio.getFontScale();

const MealSearchPage = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<FoodSearchResponse | null>(null);

  const { selectedMealType } = useMealType();

  const handleSubmit = async () => {
    // Empty Search
    if (!search.trim()) {
      return;
    }
    // Search term must be at least 2 characters
    if (search.trim().length < 2) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the API with proper typing
      const response: FoodSearchResponse = await NutritionApiService.getFoodFromSearch(search.trim(), 10);

      // Store the full response for debugging/info
      setSearchResults(response);

      // Extract and set the foods array
      setFoods(response.foods);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Search failed');
      setFoods([]);
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
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
          autoCorrect={false}
          autoCapitalize='none'
        />
      </View>

      <View style={styles.searchOptionsContainer}>
        <TouchableOpacity style={styles.searchOptionContainer}>
          <Icon
            name='barcode-outline'
            type='ionicon'
          />
          <Text style={styles.searchOptionText}>Barcode Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.searchResultsContainer}>
        <Text style={styles.searchResultsText}>
          Search Results
          {searchResults && (
            <Text style={styles.searchStatsText}>
              {` (${searchResults.total_results} found, ${searchResults.local_results} local)`}
            </Text>
          )}
        </Text>

        {loading && (
          <Text style={styles.loadingText}>Searching...</Text>
        )}

        {/* Display search results */}
        {foods.length > 0 && (
          <View>
            {foods.map((food: FoodItem, index: number) => (
              <IndividualFoodOption key={index} item={food} />
            ))}
          </View>
        )}

        {!loading && foods.length === 0 && search && (
          <Text style={styles.noResultsText}>
            No results found. Try a different search term.
          </Text>
        )}
      </View>

      <View style={styles.foodHistoryContainer}>
        <Text style={styles.historyText}>History</Text>
      </View>
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
  },
  errorContainer: {
    marginHorizontal: wp(2),
    marginVertical: hp(0.5),
    padding: wp(2),
    backgroundColor: '#fee',
    borderRadius: 8,
  },
  errorText: {
    color: '#c00',
    fontSize: rf(14),
  },
  loadingText: {
    fontSize: rf(14),
    color: '#666',
    fontStyle: 'italic',
  },
  searchStatsText: {
    fontSize: rf(12),
    color: '#666',
    fontWeight: 'normal',
  },
  foodItemContainer: {
    backgroundColor: 'white',
    marginVertical: hp(0.5),
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  foodItemContent: {
    padding: wp(3),
  },
  foodName: {
    fontSize: rf(16),
    fontWeight: '600',
    color: '#333',
  },
  foodBrand: {
    fontSize: rf(14),
    color: '#666',
    marginTop: 2,
  },
  foodSource: {
    fontSize: rf(12),
    color: '#999',
    marginTop: 4,
  },
  nutritionPreview: {
    fontSize: rf(12),
    color: '#007AFF',
    marginTop: 4,
  },
  noResultsText: {
    fontSize: rf(14),
    color: '#666',
    textAlign: 'center',
    marginTop: hp(2),
    fontStyle: 'italic',
  },
})