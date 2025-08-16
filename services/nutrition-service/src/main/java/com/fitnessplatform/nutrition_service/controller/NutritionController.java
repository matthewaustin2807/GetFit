package com.fitnessplatform.nutrition_service.controller;

import com.fitnessplatform.nutrition_service.entity.Food;
import com.fitnessplatform.nutrition_service.entity.FoodNutrition;
import com.fitnessplatform.nutrition_service.repository.FoodNutritionRepository;
import com.fitnessplatform.nutrition_service.repository.FoodRepository;
import com.fitnessplatform.nutrition_service.service.FoodImportService;
import com.fitnessplatform.nutrition_service.service.FoodSearchService;
import com.fitnessplatform.nutrition_service.service.OpenFoodFactsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/nutrition")
@CrossOrigin(origins = "*")
public class NutritionController {

  @Autowired
  private FoodNutritionRepository nutritionRepository;

  @Autowired
  private OpenFoodFactsService openFoodFactsService;

  @Autowired
  private FoodSearchService foodSearchService;

  @Autowired
  private FoodRepository foodRepository;

  // Import common foods from Open Food Facts API
  @PostMapping("/import/quick-start")
  public ResponseEntity<?> quickStartImport() {
    try {
      openFoodFactsService.importCommonFoodsFromAPI();

      return ResponseEntity.ok(Map.of(
          "message", "Quick start foods imported successfully",
          "source", "Open Food Facts API",
          "note", "10 common foods with complete nutrition data added"
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Import failed: " + e.getMessage()
      ));
    }
  }

  // Add nutrition data to a food
  @PostMapping("/foods/{foodId}")
  public ResponseEntity<?> addNutritionData(@PathVariable Long foodId,
                                            @RequestBody Map<String, Object> request) {
    try {
      // Parse nutrition values
      BigDecimal calories = parseBigDecimal(request.get("calories"));
      BigDecimal protein = parseBigDecimal(request.get("protein"));
      BigDecimal carbs = parseBigDecimal(request.get("carbs"));
      BigDecimal fat = parseBigDecimal(request.get("fat"));
      BigDecimal fiber = parseBigDecimal(request.get("fiber"));
      BigDecimal sugar = parseBigDecimal(request.get("sugar"));
      BigDecimal sodium = parseBigDecimal(request.get("sodium"));

      // Validate required fields
      if (calories == null || protein == null || carbs == null || fat == null) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", "Calories, protein, carbs, and fat are required"
        ));
      }

      // Check if nutrition data already exists
      Optional<FoodNutrition> existing = nutritionRepository.findByFoodId(foodId);

      FoodNutrition nutrition;
      if (existing.isPresent()) {
        // Update existing nutrition data
        nutrition = existing.get();
        nutrition.setCalories(calories);
        nutrition.setProteinG(protein);
        nutrition.setCarbsG(carbs);
        nutrition.setFatG(fat);
        nutrition.setFiberG(fiber);
        nutrition.setSugarG(sugar);
        nutrition.setSodiumMg(sodium);
      } else {
        // Create new nutrition data
        nutrition = new FoodNutrition(foodId, calories, protein, carbs, fat);
        nutrition.setFiberG(fiber);
        nutrition.setSugarG(sugar);
        nutrition.setSodiumMg(sodium);
      }

      FoodNutrition savedNutrition = nutritionRepository.save(nutrition);

      return ResponseEntity.ok(Map.of(
          "message", "Nutrition data saved successfully",
          "nutrition", createNutritionResponse(savedNutrition)
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to save nutrition data: " + e.getMessage()
      ));
    }
  }

  // Get nutrition data for a food
  @GetMapping("/foods/{foodId}")
  public ResponseEntity<?> getNutritionData(@PathVariable Long foodId) {
    try {
      Optional<FoodNutrition> nutrition = nutritionRepository.findByFoodId(foodId);

      if (nutrition.isPresent()) {
        return ResponseEntity.ok(Map.of(
            "message", "Nutrition data found",
            "nutrition", createNutritionResponse(nutrition.get())
        ));
      } else {
        return ResponseEntity.notFound().build();
      }

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to get nutrition data: " + e.getMessage()
      ));
    }
  }

  // Calculate nutrition for specific serving size
  @GetMapping("/foods/{foodId}/calculate")
  public ResponseEntity<?> calculateNutrition(@PathVariable Long foodId,
                                              @RequestParam("grams") Double grams) {
    try {
      Optional<FoodNutrition> nutritionOpt = nutritionRepository.findByFoodId(foodId);

      if (nutritionOpt.isEmpty()) {
        return ResponseEntity.notFound().build();
      }

      FoodNutrition nutrition = nutritionOpt.get();
      BigDecimal gramsDecimal = BigDecimal.valueOf(grams);

      Map<String, Object> calculated = new HashMap<>();
      calculated.put("grams", grams);
      calculated.put("calories", nutrition.calculateCaloriesFor(gramsDecimal));
      calculated.put("protein", nutrition.calculateProteinFor(gramsDecimal));
      calculated.put("carbs", nutrition.calculateCarbsFor(gramsDecimal));
      calculated.put("fat", nutrition.calculateFatFor(gramsDecimal));

      return ResponseEntity.ok(Map.of(
          "message", "Nutrition calculated for " + grams + "g",
          "nutrition", calculated
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to calculate nutrition: " + e.getMessage()
      ));
    }
  }

  // Clear all nutrition and food data
  @DeleteMapping("/clear-all")
  public ResponseEntity<?> clearAllData() {
    try {
      // Delete in correct order (foreign keys)
      long nutritionCount = nutritionRepository.count();
      long foodCount = foodRepository.count();

      nutritionRepository.deleteAll();
      foodRepository.deleteAll();

      return ResponseEntity.ok(Map.of(
          "message", "Database cleared successfully",
          "deletedNutrition", nutritionCount,
          "deletedFoods", foodCount
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to clear database: " + e.getMessage()
      ));
    }
  }

  // Helper methods
  private BigDecimal parseBigDecimal(Object value) {
    if (value == null) return null;
    if (value instanceof Number) {
      return BigDecimal.valueOf(((Number) value).doubleValue());
    }
    if (value instanceof String) {
      String str = (String) value;
      return str.trim().isEmpty() ? null : new BigDecimal(str);
    }
    return null;
  }

  private Map<String, Object> createNutritionResponse(FoodNutrition nutrition) {
    Map<String, Object> response = new HashMap<>();
    response.put("id", nutrition.getId());
    response.put("foodId", nutrition.getFoodId());
    response.put("calories", nutrition.getCalories());
    response.put("protein", nutrition.getProteinG());
    response.put("carbs", nutrition.getCarbsG());
    response.put("fat", nutrition.getFatG());
    response.put("fiber", nutrition.getFiberG());
    response.put("sugar", nutrition.getSugarG());
    response.put("sodium", nutrition.getSodiumMg());
    response.put("createdAt", nutrition.getCreatedAt());
    response.put("updatedAt", nutrition.getUpdatedAt());
    return response;
  }
}