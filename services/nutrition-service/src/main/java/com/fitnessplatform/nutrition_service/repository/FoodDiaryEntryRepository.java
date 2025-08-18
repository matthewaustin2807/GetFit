package com.fitnessplatform.nutrition_service.repository;

import com.fitnessplatform.nutrition_service.dto.DailyNutritionTotals;
import com.fitnessplatform.nutrition_service.entity.FoodDiaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FoodDiaryEntryRepository extends JpaRepository<FoodDiaryEntry, Long> {

  // Find all meals for a user on a specific date
  List<FoodDiaryEntry> findByUserIdAndEntryDateOrderByLoggedAtAsc(Long userId, LocalDate loggedAt);

  // Find meals by user and meal type for a date
  List<FoodDiaryEntry> findByUserIdAndEntryDateAndMealTypeOrderByLoggedAtAsc(
      Long userId, LocalDate entryDate, FoodDiaryEntry.MealType mealType);

  // Find all meals for a user in a date range
  List<FoodDiaryEntry> findByUserIdAndEntryDateBetweenOrderByEntryDateDescLoggedAtDesc(
      Long userId, LocalDate startDate, LocalDate endDate);

  // Calculate daily nutrition totals
  @Query("SELECT " +
      "COALESCE(SUM(e.caloriesConsumed), 0) as totalCalories, " +
      "COALESCE(SUM(e.proteinConsumed), 0) as totalProtein, " +
      "COALESCE(SUM(e.carbsConsumed), 0) as totalCarbs, " +
      "COALESCE(SUM(e.fatConsumed), 0) as totalFat, " +
      "COALESCE(SUM(e.fiberConsumed), 0) as totalFiber, " +
      "COALESCE(SUM(e.sugarConsumed), 0) as totalSugar, " +
      "COALESCE(SUM(e.sodiumConsumed), 0) as totalSodium " +
      "FROM FoodDiaryEntry e " +
      "WHERE e.userId = :userId AND e.entryDate = :date")
  DailyNutritionTotals getDailyNutritionTotals(@Param("userId") Long userId, @Param("date") LocalDate date);

  // Get meal count for a specific meal type on a date
  @Query("SELECT COUNT(e) FROM FoodDiaryEntry e " +
      "WHERE e.userId = :userId AND e.entryDate = :date AND e.mealType = :mealType")
  Long countMealsByTypeAndDate(@Param("userId") Long userId,
                               @Param("date") LocalDate date,
                               @Param("mealType") FoodDiaryEntry.MealType mealType);

  // Delete a meal entry
  void deleteByIdAndUserId(Long id, Long userId);

  // Find all meals for a user (for debugging)
  List<FoodDiaryEntry> findByUserIdOrderByLoggedAtDesc(Long userId);
}