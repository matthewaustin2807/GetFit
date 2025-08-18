package com.fitnessplatform.nutrition_service.controller;

import com.fitnessplatform.nutrition_service.entity.FoodDiaryEntry;
import com.fitnessplatform.nutrition_service.repository.FoodDiaryEntryRepository;
import com.fitnessplatform.nutrition_service.service.MealLoggingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meals")
@CrossOrigin(origins = "*")
public class MealController {

  @Autowired
  private MealLoggingService mealLoggingService;

  @Autowired
  private FoodDiaryEntryRepository diaryRepository;

  // Debug: Get all meals for a user (regardless of date)
  @GetMapping("/debug/all")
  public ResponseEntity<?> getAllMealsForUser(@RequestParam Long userId) {
    try {
      // Get ALL diary entries for this user
      List<FoodDiaryEntry> allEntries = diaryRepository.findByUserIdOrderByLoggedAtDesc(userId);

      List<Map<String, Object>> debugInfo = new ArrayList<>();
      for (FoodDiaryEntry entry : allEntries) {
        Map<String, Object> info = new HashMap<>();
        info.put("id", entry.getId());
        info.put("userId", entry.getUserId());
        info.put("foodId", entry.getFoodId());
        info.put("entryDate", entry.getEntryDate());
        info.put("mealType", entry.getMealType());
        info.put("quantityGrams", entry.getQuantityGrams());
        info.put("loggedAt", entry.getLoggedAt());
        info.put("calories", entry.getCaloriesConsumed());
        debugInfo.add(info);
      }

      return ResponseEntity.ok(Map.of(
          "message", "All meals for user " + userId,
          "count", allEntries.size(),
          "meals", debugInfo,
          "currentDate", LocalDate.now(),
          "currentDateTime", java.time.LocalDateTime.now()
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", e.getMessage()
      ));
    }
  }

  // Log a meal
  @PostMapping("/log")
  public ResponseEntity<?> logMeal(@RequestBody Map<String, Object> request) {
    try {
      // Parse request data
      Long userId = parseLong(request.get("userId"));
      Long foodId = parseLong(request.get("foodId"));
      Double quantityGrams = parseDouble(request.get("quantityGrams"));
      String mealTypeStr = (String) request.get("mealType");
      String dateStr = (String) request.get("date"); // Format: "2025-01-15"
      String notes = (String) request.get("notes");

      // Validate required fields
      if (userId == null || foodId == null || quantityGrams == null || mealTypeStr == null) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", "userId, foodId, quantityGrams, and mealType are required"
        ));
      }

      if (quantityGrams <= 0) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", "Quantity must be greater than 0"
        ));
      }

      // Parse meal type
      FoodDiaryEntry.MealType mealType;
      try {
        mealType = FoodDiaryEntry.MealType.valueOf(mealTypeStr.toUpperCase());
      } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", "Invalid meal type. Valid options: BREAKFAST, LUNCH, DINNER, SNACK, OTHER"
        ));
      }

      // Parse date (default to today if not provided)
      LocalDate entryDate = LocalDate.now();
      if (dateStr != null && !dateStr.trim().isEmpty()) {
        try {
          entryDate = LocalDate.parse(dateStr);
        } catch (DateTimeParseException e) {
          return ResponseEntity.badRequest().body(Map.of(
              "error", "Invalid date format. Use YYYY-MM-DD"
          ));
        }
      }

      // Log the meal
      FoodDiaryEntry entry = mealLoggingService.logMeal(
          userId, foodId, quantityGrams, mealType, entryDate, notes
      );

      return ResponseEntity.ok(Map.of(
          "message", "Meal logged successfully",
          "entry", createMealEntryResponse(entry)
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to log meal: " + e.getMessage()
      ));
    }
  }

  // Get today's meals for a user
  @GetMapping("/today")
  public ResponseEntity<?> getTodaysMeals(@RequestParam Long userId) {
    try {
      LocalDate today = LocalDate.now();
      List<Map<String, Object>> meals = mealLoggingService.getTodaysMeals(userId, today);

      return ResponseEntity.ok(Map.of(
          "message", "Today's meals retrieved",
          "date", today,
          "userId", userId,
          "mealCount", meals.size(),
          "meals", meals
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to get today's meals: " + e.getMessage()
      ));
    }
  }

  // Get meals for a specific date
  @GetMapping("/date/{date}")
  public ResponseEntity<?> getMealsByDate(@PathVariable String date, @RequestParam Long userId) {
    try {
      LocalDate entryDate = LocalDate.parse(date);
      List<Map<String, Object>> meals = mealLoggingService.getTodaysMeals(userId, entryDate);

      return ResponseEntity.ok(Map.of(
          "message", "Meals retrieved for " + date,
          "date", entryDate,
          "userId", userId,
          "mealCount", meals.size(),
          "meals", meals
      ));

    } catch (DateTimeParseException e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Invalid date format. Use YYYY-MM-DD"
      ));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to get meals: " + e.getMessage()
      ));
    }
  }

  // Get meals by type (breakfast, lunch, dinner, snack)
  @GetMapping("/type/{mealType}")
  public ResponseEntity<?> getMealsByType(@PathVariable String mealType,
                                          @RequestParam Long userId,
                                          @RequestParam(required = false) String date) {
    try {
      // Parse meal type
      FoodDiaryEntry.MealType type = FoodDiaryEntry.MealType.valueOf(mealType.toUpperCase());

      // Parse date (default to today)
      LocalDate entryDate = date != null ? LocalDate.parse(date) : LocalDate.now();

      List<Map<String, Object>> meals = mealLoggingService.getMealsByType(userId, entryDate, type);

      return ResponseEntity.ok(Map.of(
          "message", mealType + " meals retrieved",
          "mealType", type,
          "date", entryDate,
          "userId", userId,
          "meals", meals
      ));

    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Invalid meal type. Valid options: BREAKFAST, LUNCH, DINNER, SNACK, OTHER"
      ));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to get meals by type: " + e.getMessage()
      ));
    }
  }

  // Get daily nutrition summary
  @GetMapping("/summary/{date}")
  public ResponseEntity<?> getDailyNutritionSummary(@PathVariable String date, @RequestParam Long userId) {
    try {
      LocalDate summaryDate = LocalDate.parse(date);
      Map<String, Object> summary = mealLoggingService.getDailyNutritionSummary(userId, summaryDate);

      return ResponseEntity.ok(Map.of(
          "message", "Daily nutrition summary",
          "summary", summary
      ));

    } catch (DateTimeParseException e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Invalid date format. Use YYYY-MM-DD"
      ));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to get daily summary: " + e.getMessage()
      ));
    }
  }

  // Get current day summary (convenience endpoint)
  @GetMapping("/summary/today")
  public ResponseEntity<?> getTodaysSummary(@RequestParam Long userId) {
    try {
      LocalDate today = LocalDate.now();
      Map<String, Object> summary = mealLoggingService.getDailyNutritionSummary(userId, today);

      return ResponseEntity.ok(Map.of(
          "message", "Today's nutrition summary",
          "summary", summary
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to get today's summary: " + e.getMessage()
      ));
    }
  }

  // Delete a meal entry
  @DeleteMapping("/{entryId}")
  public ResponseEntity<?> deleteMeal(@PathVariable Long entryId, @RequestParam Long userId) {
    try {
      mealLoggingService.deleteMeal(entryId, userId);

      return ResponseEntity.ok(Map.of(
          "message", "Meal deleted successfully",
          "entryId", entryId
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to delete meal: " + e.getMessage()
      ));
    }
  }

  // Get weekly meal history
  @GetMapping("/week")
  public ResponseEntity<?> getWeeklyMeals(@RequestParam Long userId,
                                          @RequestParam(required = false) String startDate) {
    try {
      LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(7);
      LocalDate end = start.plusDays(6); // 7 days total

      List<Map<String, Object>> meals = mealLoggingService.getWeeklyMeals(userId, start, end);

      return ResponseEntity.ok(Map.of(
          "message", "Weekly meals retrieved",
          "startDate", start,
          "endDate", end,
          "userId", userId,
          "totalMeals", meals.size(),
          "meals", meals
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Failed to get weekly meals: " + e.getMessage()
      ));
    }
  }

  // Helper methods
  private Map<String, Object> createMealEntryResponse(FoodDiaryEntry entry) {
    Map<String, Object> response = new HashMap<>();
    response.put("id", entry.getId());
    response.put("userId", entry.getUserId());
    response.put("foodId", entry.getFoodId());
    response.put("entryDate", entry.getEntryDate());
    response.put("mealType", entry.getMealType());
    response.put("quantityGrams", entry.getQuantityGrams());
    response.put("notes", entry.getNotes());
    response.put("loggedAt", entry.getLoggedAt());

    // Consumed nutrition
    Map<String, Object> nutrition = new HashMap<>();
    nutrition.put("calories", entry.getCaloriesConsumed());
    nutrition.put("protein", entry.getProteinConsumed());
    nutrition.put("carbs", entry.getCarbsConsumed());
    nutrition.put("fat", entry.getFatConsumed());
    nutrition.put("fiber", entry.getFiberConsumed());
    nutrition.put("sugar", entry.getSugarConsumed());
    nutrition.put("sodium", entry.getSodiumConsumed());
    response.put("nutrition", nutrition);

    return response;
  }

  private Long parseLong(Object value) {
    if (value == null) return null;
    if (value instanceof Number) return ((Number) value).longValue();
    if (value instanceof String) {
      String str = (String) value;
      return str.trim().isEmpty() ? null : Long.parseLong(str);
    }
    return null;
  }

  private Double parseDouble(Object value) {
    if (value == null) return null;
    if (value instanceof Number) return ((Number) value).doubleValue();
    if (value instanceof String) {
      String str = (String) value;
      return str.trim().isEmpty() ? null : Double.parseDouble(str);
    }
    return null;
  }
}