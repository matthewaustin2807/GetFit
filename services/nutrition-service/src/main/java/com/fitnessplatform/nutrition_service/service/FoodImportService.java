package com.fitnessplatform.nutrition_service.service;

import com.fitnessplatform.nutrition_service.entity.Food;
import com.fitnessplatform.nutrition_service.entity.FoodNutrition;
import com.fitnessplatform.nutrition_service.repository.FoodRepository;
import com.fitnessplatform.nutrition_service.repository.FoodNutritionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Service
public class FoodImportService {

  @Autowired
  private FoodRepository foodRepository;

  @Autowired
  private FoodNutritionRepository nutritionRepository;

  @Transactional
  public void importCommonFoods() {
    List<FoodData> commonFoods = getCommonFoodsData();

    for (FoodData foodData : commonFoods) {
      // Create food
      Food food = new Food(foodData.name, foodData.brand, foodData.barcode);
      Food savedFood = foodRepository.save(food);

      // Create nutrition data
      FoodNutrition nutrition = new FoodNutrition(
          savedFood.getId(),
          BigDecimal.valueOf(foodData.calories),
          BigDecimal.valueOf(foodData.protein),
          BigDecimal.valueOf(foodData.carbs),
          BigDecimal.valueOf(foodData.fat)
      );

      if (foodData.fiber != null) nutrition.setFiberG(BigDecimal.valueOf(foodData.fiber));
      if (foodData.sugar != null) nutrition.setSugarG(BigDecimal.valueOf(foodData.sugar));
      if (foodData.sodium != null) nutrition.setSodiumMg(BigDecimal.valueOf(foodData.sodium));

      nutritionRepository.save(nutrition);
    }
  }

  private List<FoodData> getCommonFoodsData() {
    return Arrays.asList(
        // Fruits (per 100g)
        new FoodData("Apple", "Fresh", "4011", 52, 0.3, 13.8, 0.2, 2.4, 10.4, 1.0),
        new FoodData("Banana", "Fresh", "4011", 89, 1.1, 22.8, 0.3, 2.6, 12.2, 1.0),
        new FoodData("Orange", "Fresh", "3107", 47, 0.9, 11.8, 0.1, 2.4, 9.4, 0.0),
        new FoodData("Strawberries", "Fresh", "0003", 32, 0.7, 7.7, 0.3, 2.0, 4.9, 1.0),
        new FoodData("Grapes", "Fresh", "4023", 62, 0.6, 16.0, 0.2, 0.9, 16.0, 2.0),

        // Vegetables (per 100g)
        new FoodData("Broccoli", "Fresh", "4060", 34, 2.8, 7.0, 0.4, 2.6, 1.5, 33.0),
        new FoodData("Spinach", "Fresh", "4090", 23, 2.9, 3.6, 0.4, 2.2, 0.4, 79.0),
        new FoodData("Carrots", "Fresh", "4094", 41, 0.9, 9.6, 0.2, 2.8, 4.7, 69.0),
        new FoodData("Tomatoes", "Fresh", "4799", 18, 0.9, 3.9, 0.2, 1.2, 2.6, 5.0),
        new FoodData("Bell Pepper", "Fresh", "4688", 31, 1.0, 7.3, 0.3, 2.5, 4.2, 4.0),

        // Proteins (per 100g cooked)
        new FoodData("Chicken Breast", "Fresh", "0001", 165, 31.0, 0.0, 3.6, 0.0, 0.0, 74.0),
        new FoodData("Salmon", "Fresh", "0002", 208, 25.4, 0.0, 12.4, 0.0, 0.0, 59.0),
        new FoodData("Ground Beef", "85% Lean", "0003", 250, 26.0, 0.0, 15.0, 0.0, 0.0, 75.0),
        new FoodData("Eggs", "Large", "0004", 155, 13.0, 1.1, 11.0, 0.0, 0.0, 124.0),
        new FoodData("Tuna", "Canned in Water", "0005", 116, 25.5, 0.0, 0.8, 0.0, 0.0, 247.0),

        // Grains (per 100g cooked)
        new FoodData("Brown Rice", "Cooked", "0010", 123, 2.6, 23.0, 0.9, 1.8, 0.4, 5.0),
        new FoodData("Quinoa", "Cooked", "0011", 120, 4.4, 21.3, 1.9, 2.8, 0.9, 7.0),
        new FoodData("Oats", "Cooked", "0012", 68, 2.4, 12.0, 1.4, 1.7, 0.3, 49.0),
        new FoodData("Whole Wheat Bread", "Slice", "0013", 247, 13.0, 41.0, 4.2, 7.0, 6.0, 681.0),

        // Dairy (per 100g)
        new FoodData("Greek Yogurt", "Plain", "0020", 59, 10.0, 3.6, 0.4, 0.0, 3.6, 36.0),
        new FoodData("Milk", "2%", "0021", 50, 3.3, 4.8, 2.0, 0.0, 4.8, 44.0),
        new FoodData("Cheddar Cheese", "Sharp", "0022", 403, 25.0, 1.3, 33.0, 0.0, 0.5, 621.0),

        // Nuts & Seeds (per 100g)
        new FoodData("Almonds", "Raw", "0030", 579, 21.0, 22.0, 50.0, 12.0, 4.4, 1.0),
        new FoodData("Peanut Butter", "Natural", "0031", 588, 25.0, 20.0, 50.0, 8.0, 9.2, 17.0),
        new FoodData("Chia Seeds", "Organic", "0032", 486, 17.0, 42.0, 31.0, 34.0, 0.0, 16.0),

        // Legumes (per 100g cooked)
        new FoodData("Black Beans", "Cooked", "0040", 132, 8.9, 23.0, 0.5, 8.7, 0.3, 2.0),
        new FoodData("Lentils", "Cooked", "0041", 116, 9.0, 20.0, 0.4, 7.9, 1.8, 2.0),
        new FoodData("Chickpeas", "Cooked", "0042", 164, 8.9, 27.0, 2.6, 8.0, 2.0, 7.0)
    );
  }

  // Inner class for food data structure
  private static class FoodData {
    String name, brand, barcode;
    double calories, protein, carbs, fat;
    Double fiber, sugar, sodium;

    FoodData(String name, String brand, String barcode, double calories,
             double protein, double carbs, double fat, Double fiber, Double sugar, Double sodium) {
      this.name = name;
      this.brand = brand;
      this.barcode = barcode;
      this.calories = calories;
      this.protein = protein;
      this.carbs = carbs;
      this.fat = fat;
      this.fiber = fiber;
      this.sugar = sugar;
      this.sodium = sodium;
    }
  }
}