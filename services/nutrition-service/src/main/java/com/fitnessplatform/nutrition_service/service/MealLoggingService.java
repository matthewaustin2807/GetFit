package com.fitnessplatform.nutrition_service.service;

import com.fitnessplatform.nutrition_service.dto.DailyNutritionTotals;
import com.fitnessplatform.nutrition_service.entity.Food;
import com.fitnessplatform.nutrition_service.entity.FoodNutrition;
import com.fitnessplatform.nutrition_service.entity.FoodDiaryEntry;
import com.fitnessplatform.nutrition_service.repository.FoodRepository;
import com.fitnessplatform.nutrition_service.repository.FoodNutritionRepository;
import com.fitnessplatform.nutrition_service.repository.FoodDiaryEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
public class MealLoggingService {

  @Autowired
  private FoodDiaryEntryRepository diaryRepository;

  @Autowired
  private FoodRepository foodRepository;

  @Autowired
  private FoodNutritionRepository nutritionRepository;

  @Transactional
  public FoodDiaryEntry logMeal(Long userId, Long foodId, Double quantityGrams,
                                FoodDiaryEntry.MealType mealType, LocalDate entryDate, String notes) {

    // Validate food exists
    Food food = foodRepository.findById(foodId)
        .orElseThrow(() -> new RuntimeException("Food not found: " + foodId));

    // Get nutrition data
    Optional<FoodNutrition> nutritionOpt = nutritionRepository.findByFoodId(foodId);

    // Create diary entry
    FoodDiaryEntry entry = new FoodDiaryEntry(
        userId, foodId, entryDate, mealType, BigDecimal.valueOf(quantityGrams)
    );

    // Calculate nutrition for the consumed quantity
    if (nutritionOpt.isPresent()) {
      FoodNutrition nutrition = nutritionOpt.get();
      BigDecimal multiplier = BigDecimal.valueOf(quantityGrams / 100.0); // Convert from per 100g

      entry.setCaloriesConsumed(nutrition.getCalories().multiply(multiplier).setScale(2, RoundingMode.HALF_UP));
      entry.setProteinConsumed(nutrition.getProteinG().multiply(multiplier).setScale(2, RoundingMode.HALF_UP));
      entry.setCarbsConsumed(nutrition.getCarbsG().multiply(multiplier).setScale(2, RoundingMode.HALF_UP));
      entry.setFatConsumed(nutrition.getFatG().multiply(multiplier).setScale(2, RoundingMode.HALF_UP));

      if (nutrition.getFiberG() != null) {
        entry.setFiberConsumed(nutrition.getFiberG().multiply(multiplier).setScale(2, RoundingMode.HALF_UP));
      }
      if (nutrition.getSugarG() != null) {
        entry.setSugarConsumed(nutrition.getSugarG().multiply(multiplier).setScale(2, RoundingMode.HALF_UP));
      }
      if (nutrition.getSodiumMg() != null) {
        entry.setSodiumConsumed(nutrition.getSodiumMg().multiply(multiplier).setScale(2, RoundingMode.HALF_UP));
      }
    }

    if (notes != null && !notes.trim().isEmpty()) {
      entry.setNotes(notes.trim());
    }

    return diaryRepository.save(entry);
  }

  public List<Map<String, Object>> getTodaysMeals(Long userId, LocalDate date) {
    List<FoodDiaryEntry> entries = diaryRepository.findByUserIdAndEntryDateOrderByLoggedAtAsc(userId, date);

    List<Map<String, Object>> meals = new ArrayList<>();

    for (FoodDiaryEntry entry : entries) {
      Optional<Food> food = foodRepository.findById(entry.getFoodId());

      if (food.isPresent()) {
        Map<String, Object> mealData = new HashMap<>();
        mealData.put("id", entry.getId());
        mealData.put("mealType", entry.getMealType());
        mealData.put("quantityGrams", entry.getQuantityGrams());
        mealData.put("loggedAt", entry.getLoggedAt());
        mealData.put("notes", entry.getNotes());

        // Food information
        Map<String, Object> foodData = new HashMap<>();
        foodData.put("id", food.get().getId());
        foodData.put("name", food.get().getName());
        foodData.put("brand", food.get().getBrand());
        mealData.put("food", foodData);

        // Consumed nutrition
        Map<String, Object> consumedNutrition = new HashMap<>();
        consumedNutrition.put("calories", entry.getCaloriesConsumed());
        consumedNutrition.put("protein", entry.getProteinConsumed());
        consumedNutrition.put("carbs", entry.getCarbsConsumed());
        consumedNutrition.put("fat", entry.getFatConsumed());
        consumedNutrition.put("fiber", entry.getFiberConsumed());
        consumedNutrition.put("sugar", entry.getSugarConsumed());
        consumedNutrition.put("sodium", entry.getSodiumConsumed());
        mealData.put("nutrition", consumedNutrition);

        meals.add(mealData);
      }
    }

    return meals;
  }

  public Map<String, Object> getDailyNutritionSummary(Long userId, LocalDate date) {
    DailyNutritionTotals totals = diaryRepository.getDailyNutritionTotals(userId, date);

    Map<String, Object> summary = new HashMap<>();
    summary.put("date", date);
    summary.put("userId", userId);

    if (totals != null) {
      summary.put("totalCalories", totals.getTotalCalories());
      summary.put("totalProtein", totals.getTotalProtein());
      summary.put("totalCarbs", totals.getTotalCarbs());
      summary.put("totalFat", totals.getTotalFat());
      summary.put("totalFiber", totals.getTotalFiber());
      summary.put("totalSugar", totals.getTotalSugar());
      summary.put("totalSodium", totals.getTotalSodium());
    } else {
      summary.put("totalCalories", 0.0);
      summary.put("totalProtein", 0.0);
      summary.put("totalCarbs", 0.0);
      summary.put("totalFat", 0.0);
    }

    // Get meal breakdown
    Map<String, Object> mealBreakdown = new HashMap<>();
    for (FoodDiaryEntry.MealType mealType : FoodDiaryEntry.MealType.values()) {
      Long mealCount = diaryRepository.countMealsByTypeAndDate(userId, date, mealType);
      mealBreakdown.put(mealType.toString().toLowerCase(), mealCount);
    }
    summary.put("mealBreakdown", mealBreakdown);

    return summary;
  }

  public List<Map<String, Object>> getMealsByType(Long userId, LocalDate date,
                                                  FoodDiaryEntry.MealType mealType) {
    List<FoodDiaryEntry> entries = diaryRepository.findByUserIdAndEntryDateAndMealTypeOrderByLoggedAtAsc(
        userId, date, mealType);

    return convertEntriesToMealData(entries);
  }

  @Transactional
  public void deleteMeal(Long entryId, Long userId) {
    diaryRepository.deleteByIdAndUserId(entryId, userId);
  }

  public List<Map<String, Object>> getWeeklyMeals(Long userId, LocalDate startDate, LocalDate endDate) {
    List<FoodDiaryEntry> entries = diaryRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateDescLoggedAtDesc(
        userId, startDate, endDate);

    return convertEntriesToMealData(entries);
  }

  private List<Map<String, Object>> convertEntriesToMealData(List<FoodDiaryEntry> entries) {
    List<Map<String, Object>> meals = new ArrayList<>();

    for (FoodDiaryEntry entry : entries) {
      Optional<Food> food = foodRepository.findById(entry.getFoodId());

      if (food.isPresent()) {
        Map<String, Object> mealData = new HashMap<>();
        mealData.put("id", entry.getId());
        mealData.put("entryDate", entry.getEntryDate());
        mealData.put("mealType", entry.getMealType());
        mealData.put("quantityGrams", entry.getQuantityGrams());
        mealData.put("loggedAt", entry.getLoggedAt());
        mealData.put("notes", entry.getNotes());

        // Food information
        Map<String, Object> foodData = new HashMap<>();
        foodData.put("id", food.get().getId());
        foodData.put("name", food.get().getName());
        foodData.put("brand", food.get().getBrand());
        mealData.put("food", foodData);

        // Consumed nutrition
        Map<String, Object> consumedNutrition = new HashMap<>();
        consumedNutrition.put("calories", entry.getCaloriesConsumed());
        consumedNutrition.put("protein", entry.getProteinConsumed());
        consumedNutrition.put("carbs", entry.getCarbsConsumed());
        consumedNutrition.put("fat", entry.getFatConsumed());
        consumedNutrition.put("fiber", entry.getFiberConsumed());
        consumedNutrition.put("sugar", entry.getSugarConsumed());
        consumedNutrition.put("sodium", entry.getSodiumConsumed());
        mealData.put("nutrition", consumedNutrition);

        meals.add(mealData);
      }
    }

    return meals;
  }
}