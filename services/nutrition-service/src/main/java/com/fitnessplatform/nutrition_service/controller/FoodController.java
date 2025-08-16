package com.fitnessplatform.nutrition_service.controller;

import com.fitnessplatform.nutrition_service.entity.Food;
import com.fitnessplatform.nutrition_service.entity.FoodNutrition;
import com.fitnessplatform.nutrition_service.repository.FoodNutritionRepository;
import com.fitnessplatform.nutrition_service.repository.FoodRepository;
import com.fitnessplatform.nutrition_service.service.FoodSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = "*")
public class FoodController {

  @Autowired
  private FoodRepository foodRepository;

  @Autowired
  private FoodNutritionRepository nutritionRepository;

  @Autowired
  private FoodSearchService foodSearchService;

  // NEW: Enhanced search (local + API)
  @GetMapping("/search")
  public ResponseEntity<?> searchFoods(@RequestParam("q") String query,
                                       @RequestParam(value = "limit", defaultValue = "10") int limit) {
    try {
      if (query == null || query.trim().length() < 2) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", "Search query must be at least 2 characters"
        ));
      }

      Map<String, Object> results = foodSearchService.searchFoods(query.trim(), limit);
      return ResponseEntity.ok(results);

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Search failed: " + e.getMessage()
      ));
    }
  }

  // NEW: Enhanced barcode lookup (local + API)
  @GetMapping("/barcode/{barcode}")
  public ResponseEntity<?> getFoodByBarcode(@PathVariable String barcode) {
    try {
      Map<String, Object> result = foodSearchService.getFoodByBarcode(barcode);
      return ResponseEntity.ok(result);

    } catch (Exception e) {
      return ResponseEntity.notFound().build();
    }
  }

  // NEW: Cache food from API to local database
  @PostMapping("/cache/{barcode}")
  public ResponseEntity<?> cacheFoodLocally(@PathVariable String barcode) {
    try {
      Map<String, Object> result = foodSearchService.saveAndCacheFoodFromAPI(barcode);
      return ResponseEntity.ok(result);

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to cache food: " + e.getMessage()
      ));
    }
  }

  @GetMapping("/{id}/complete")
  public ResponseEntity<?> getFoodWithNutrition(@PathVariable Long id) {
    try {
      Optional<Food> foodOpt = foodRepository.findById(id);

      if (foodOpt.isEmpty()) {
        return ResponseEntity.notFound().build();
      }

      Food food = foodOpt.get();

      // Get nutrition data
      Optional<FoodNutrition> nutritionOpt = nutritionRepository.findByFoodId(id);

      Map<String, Object> response = new HashMap<>();
      response.put("id", food.getId());
      response.put("name", food.getName());
      response.put("brand", food.getBrand());
      response.put("barcode", food.getBarcode());

      if (nutritionOpt.isPresent()) {
        FoodNutrition nutrition = nutritionOpt.get();
        Map<String, Object> nutritionData = new HashMap<>();
        nutritionData.put("calories", nutrition.getCalories());
        nutritionData.put("protein", nutrition.getProteinG());
        nutritionData.put("carbs", nutrition.getCarbsG());
        nutritionData.put("fat", nutrition.getFatG());
        nutritionData.put("fiber", nutrition.getFiberG());
        nutritionData.put("sugar", nutrition.getSugarG());
        nutritionData.put("sodium", nutrition.getSodiumMg());

        response.put("nutrition", nutritionData);
        response.put("hasNutrition", true);
      } else {
        response.put("hasNutrition", false);
      }

      return ResponseEntity.ok(Map.of(
          "message", "Food with nutrition data",
          "food", response
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to get food: " + e.getMessage()
      ));
    }
  }

  // Get popular foods (for home screen suggestions)
  @GetMapping("/popular")
  public ResponseEntity<?> getPopularFoods() {
    try {
      List<Food> foods = foodRepository.findTop20PopularFoods();

      return ResponseEntity.ok(Map.of(
          "message", "Popular foods retrieved",
          "foods", foods
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to get popular foods: " + e.getMessage()
      ));
    }
  }

  // Get all foods (admin/testing)
  @GetMapping
  public ResponseEntity<?> getAllFoods() {
    try {
      List<Food> foods = foodRepository.findAll();

      return ResponseEntity.ok(Map.of(
          "message", "All foods retrieved",
          "count", foods.size(),
          "foods", foods
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to get foods: " + e.getMessage()
      ));
    }
  }

  // Create new food (for testing)
  @PostMapping
  public ResponseEntity<?> createFood(@RequestBody Map<String, String> request) {
    try {
      String name = request.get("name");
      String brand = request.get("brand");
      String barcode = request.get("barcode");

      if (name == null || name.trim().isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", "Food name is required"
        ));
      }

      Food food = new Food(name.trim(), brand, barcode);
      Food savedFood = foodRepository.save(food);

      return ResponseEntity.ok(Map.of(
          "message", "Food created successfully",
          "food", savedFood
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to create food: " + e.getMessage()
      ));
    }
  }

  // Get food by ID
  @GetMapping("/{id}")
  public ResponseEntity<?> getFoodById(@PathVariable Long id) {
    try {
      Optional<Food> food = foodRepository.findById(id);

      if (food.isPresent()) {
        return ResponseEntity.ok(Map.of(
            "message", "Food found",
            "food", food.get()
        ));
      } else {
        return ResponseEntity.notFound().build();
      }

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to get food: " + e.getMessage()
      ));
    }
  }
}