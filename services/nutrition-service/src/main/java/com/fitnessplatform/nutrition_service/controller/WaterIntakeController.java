package com.fitnessplatform.nutrition_service.controller;

import com.fitnessplatform.nutrition_service.entity.WaterIntake;
import com.fitnessplatform.nutrition_service.service.WaterIntakeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/water")
@CrossOrigin(origins = "*")
public class WaterIntakeController {

  @Autowired
  private WaterIntakeService waterService;

  @PostMapping("/log")
  public ResponseEntity<?> logWaterIntake(@RequestBody Map<String, Object> request) {
    try {
      Long userId = parseLong(request.get("userId"));
      Double glasses = parseDouble(request.get("glasses"));
      String dateStr = (String) request.get("date");

      if (userId == null || glasses == null) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", "userId and glasses are required"
        ));
      }

      LocalDate date = dateStr != null ? LocalDate.parse(dateStr) : LocalDate.now();
      WaterIntake intake = waterService.logWater(userId, glasses, date);

      return ResponseEntity.ok(Map.of(
          "message", "Water intake logged successfully",
          "totalToday", intake.getGlassesConsumed(),
          "date", intake.getIntakeDate(),
          "glasses_added", glasses
      ));

    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (DateTimeParseException e) {
      return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format. Use YYYY-MM-DD"));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", "Failed to log water: " + e.getMessage()));
    }
  }

  @GetMapping("/today")
  public ResponseEntity<?> getTodayIntake(@RequestParam Long userId) {
    try {
      BigDecimal todayIntake = waterService.getTodayIntake(userId);

      return ResponseEntity.ok(Map.of(
          "userId", userId,
          "date", LocalDate.now(),
          "glassesConsumed", todayIntake,
          "dailyGoal", 8.0 // Make this configurable per user later
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", "Failed to get today's intake: " + e.getMessage()));
    }
  }

  @GetMapping("/weekly")
  public ResponseEntity<?> getWeeklyIntake(@RequestParam Long userId) {
    try {
      List<WaterIntake> weeklyData = waterService.getWeeklyIntake(userId);

      return ResponseEntity.ok(Map.of(
          "message", "Weekly water intake retrieved",
          "userId", userId,
          "data", weeklyData
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", "Failed to get weekly intake: " + e.getMessage()));
    }
  }

  // Helper methods
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