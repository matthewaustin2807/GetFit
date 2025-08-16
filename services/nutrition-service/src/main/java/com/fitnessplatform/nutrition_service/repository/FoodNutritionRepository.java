package com.fitnessplatform.nutrition_service.repository;

import com.fitnessplatform.nutrition_service.entity.FoodNutrition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FoodNutritionRepository extends JpaRepository<FoodNutrition, Long> {

  // Find nutrition data by food ID
  Optional<FoodNutrition> findByFoodId(Long foodId);

  // Check if nutrition data exists for a food
  boolean existsByFoodId(Long foodId);

  // Delete nutrition data by food ID
  void deleteByFoodId(Long foodId);
}