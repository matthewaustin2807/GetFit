package com.fitnessplatform.nutrition_service.dto;

import java.math.BigDecimal;

public interface DailyNutritionTotals {
  BigDecimal getTotalCalories();
  BigDecimal getTotalProtein();
  BigDecimal getTotalCarbs();
  BigDecimal getTotalFat();
  BigDecimal getTotalFiber();
  BigDecimal getTotalSugar();
  BigDecimal getTotalSodium();
}