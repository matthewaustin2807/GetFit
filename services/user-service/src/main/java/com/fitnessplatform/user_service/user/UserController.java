package com.fitnessplatform.user_service.user;

import com.fitnessplatform.user_service.auth.AuthService;
import com.fitnessplatform.user_service.jwt.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

  @Autowired
  private AuthService authService;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private JwtUtil jwtUtil;

  // Get user profile by ID
  @GetMapping("/{userId}")
  public ResponseEntity<?> getUserProfile(
      @PathVariable Long userId,
      @RequestHeader(value = "Authorization", required = false) String authHeader
  ) {
    try {
      // Optional: Verify user can only access their own profile
      if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7);
        Long tokenUserId = jwtUtil.extractUserId(token);

        // Users can only access their own profile (optional security check)
        if (!tokenUserId.equals(userId)) {
          return ResponseEntity.status(403).body(Map.of("error", "Access denied: You can only access your own profile"));
        }
      }

      User user = authService.getUserProfile(userId);
      return ResponseEntity.ok(createUserResponse("Profile retrieved successfully", user));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  // Update user profile
  @PutMapping("/{userId}")
  public ResponseEntity<?> updateUserProfile(
      @PathVariable Long userId,
      @RequestBody Map<String, Object> request,
      @RequestHeader(value = "Authorization", required = false) String authHeader
  ) {
    try {
      // Verify user can only update their own profile
      if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7);
        Long tokenUserId = jwtUtil.extractUserId(token);

        if (!tokenUserId.equals(userId)) {
          return ResponseEntity.status(403).body(Map.of("error", "Access denied: You can only update your own profile"));
        }
      }

      String name = (String) request.get("name");
      Integer heightCm = parseInteger(request.get("heightCm"));
      Double currentWeightKg = parseDouble(request.get("currentWeightKg"));
      String gender = (String) request.get("gender");
      String activityLevel = (String) request.get("activityLevel");
      String fitnessGoal = (String) request.get("fitnessGoal");
      Double targetWeightKg = parseDouble(request.get("targetWeightKg"));
      Integer dailyCalories = parseInteger(request.get("dailyCalories"));
      Integer dailyProtein = parseInteger(request.get("dailyProtein"));
      Integer dailyCarbs = parseInteger(request.get("dailyCarbs"));
      Integer dailyFat = parseInteger(request.get("dailyFat"));
      Integer dailyWater = parseInteger(request.get("dailyWater"));
      Integer weeklyWorkouts = parseInteger(request.get("weeklyWorkouts"));
      String preferredUnits = (String) request.get("preferredUnits");
      String timezone = (String) request.get("timezone");

      User user = authService.updateUserProfile(
          userId, name, heightCm, currentWeightKg, gender,
          activityLevel, fitnessGoal, targetWeightKg, dailyCalories, dailyProtein, dailyCarbs, dailyFat,
          dailyWater, weeklyWorkouts, preferredUnits, timezone
      );

      return ResponseEntity.ok(createUserResponse("Profile updated successfully", user));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  // Get user's fitness summary
  @GetMapping("/{userId}/fitness-summary")
  public ResponseEntity<?> getFitnessSummary(
      @PathVariable Long userId,
      @RequestHeader(value = "Authorization", required = false) String authHeader
  ) {
    try {
      // Verify user can only access their own data
      if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7);
        Long tokenUserId = jwtUtil.extractUserId(token);

        if (!tokenUserId.equals(userId)) {
          return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
      }

      User user = authService.getUserProfile(userId);

      Map<String, Object> summary = new HashMap<>();
      summary.put("userId", user.getId());
      summary.put("name", user.getUsername());
      summary.put("age", user.getAge());
      summary.put("bmi", user.getBMI());
      summary.put("currentWeight", user.getCurrentWeightKg());
      summary.put("targetWeight", user.getTargetWeightKg());
      summary.put("weightDifference", calculateWeightDifference(user));
      summary.put("bmiCategory", getBMICategory(user.getBMI()));
      summary.put("fitnessGoal", user.getFitnessGoal());
      summary.put("activityLevel", user.getActivityLevel());
      summary.put("dailyCalories", user.getDailyCalories());
      summary.put("dailyProtein", user.getDailyProtein());
      summary.put("dailyCarbs", user.getDailyCarbs());
      summary.put("dailyFat", user.getDailyFat());
      summary.put("dailyWater", user.getDailyWater());
      summary.put("weeklyWorkouts", user.getWeeklyWorkouts());

      return ResponseEntity.ok(Map.of(
          "message", "Fitness summary retrieved successfully",
          "summary", summary
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  // Get all available enum options (for mobile app dropdowns) - PUBLIC
  @GetMapping("/options")
  public ResponseEntity<?> getProfileOptions() {
    Map<String, Object> options = new HashMap<>();

    options.put("genders", User.Gender.values());
    options.put("activityLevels", User.ActivityLevel.values());
    options.put("fitnessGoals", User.FitnessGoal.values());
    options.put("units", List.of("METRIC", "IMPERIAL"));

    return ResponseEntity.ok(Map.of(
        "message", "Profile options retrieved successfully",
        "options", options
    ));
  }

  // Change password
  @PutMapping("/{userId}/password")
  public ResponseEntity<?> changePassword(
      @PathVariable Long userId,
      @RequestBody Map<String, String> request,
      @RequestHeader(value = "Authorization", required = false) String authHeader
  ) {
    try {
      // Verify user can only change their own password
      if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7);
        Long tokenUserId = jwtUtil.extractUserId(token);

        if (!tokenUserId.equals(userId)) {
          return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
      }

      String currentPassword = request.get("currentPassword");
      String newPassword = request.get("newPassword");

      if (currentPassword == null || newPassword == null) {
        return ResponseEntity.badRequest().body(Map.of("error", "Current password and new password are required"));
      }

      User user = authService.getUserProfile(userId);

      // Verify current password
      if (!authService.verifyPassword(user.getEmail(), currentPassword)) {
        return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
      }

      // Update password
      authService.updatePassword(userId, newPassword);

      return ResponseEntity.ok(Map.of("message", "Password updated successfully"));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  // Delete user account
  @DeleteMapping("/{userId}")
  public ResponseEntity<?> deleteUser(
      @PathVariable Long userId,
      @RequestBody Map<String, String> request,
      @RequestHeader(value = "Authorization", required = false) String authHeader
  ) {
    try {
      // Verify user can only delete their own account
      if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7);
        Long tokenUserId = jwtUtil.extractUserId(token);

        if (!tokenUserId.equals(userId)) {
          return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }
      }

      String password = request.get("password");

      if (password == null) {
        return ResponseEntity.badRequest().body(Map.of("error", "Password is required to delete account"));
      }

      User user = authService.getUserProfile(userId);

      // Verify password before deletion
      if (!authService.verifyPassword(user.getEmail(), password)) {
        return ResponseEntity.badRequest().body(Map.of("error", "Incorrect password"));
      }

      userRepository.deleteById(userId);

      return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  // Helper method to create consistent user response
  private Map<String, Object> createUserResponse(String message, User user) {
    Map<String, Object> response = new HashMap<>();
    response.put("message", message);

    Map<String, Object> userMap = new HashMap<>();
    userMap.put("id", user.getId());
    userMap.put("username", user.getUsername());
    userMap.put("email", user.getEmail());
    userMap.put("dateOfBirth", user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null);
    userMap.put("heightCm", user.getHeightCm());
    userMap.put("currentWeightKg", user.getCurrentWeightKg());
    userMap.put("gender", user.getGender() != null ? user.getGender().toString() : null);
    userMap.put("activityLevel", user.getActivityLevel() != null ? user.getActivityLevel().toString() : null);
    userMap.put("fitnessGoal", user.getFitnessGoal() != null ? user.getFitnessGoal().toString() : null);
    userMap.put("targetWeightKg", user.getTargetWeightKg());
    userMap.put("dailyCalories", user.getDailyCalories());
    userMap.put("dailyProtein", user.getDailyProtein());
    userMap.put("dailyCarbs", user.getDailyCarbs());
    userMap.put("dailyFat", user.getDailyFat());
    userMap.put("dailyWater", user.getDailyWater());
    userMap.put("weeklyWorkouts", user.getWeeklyWorkouts());
    userMap.put("preferredUnits", user.getPreferredUnits());
    userMap.put("timezone", user.getTimezone());
    userMap.put("age", user.getAge());
    userMap.put("bmi", user.getBMI());
    userMap.put("createdAt", user.getCreatedAt());
    userMap.put("updatedAt", user.getUpdatedAt());

    response.put("user", userMap);
    return response;
  }

  // Helper methods
  private Integer parseInteger(Object value) {
    if (value == null) return null;
    if (value instanceof Integer) return (Integer) value;
    if (value instanceof String) {
      String str = (String) value;
      return str.trim().isEmpty() ? null : Integer.parseInt(str);
    }
    return null;
  }

  private Double parseDouble(Object value) {
    if (value == null) return null;
    if (value instanceof Double) return (Double) value;
    if (value instanceof Integer) return ((Integer) value).doubleValue();
    if (value instanceof String) {
      String str = (String) value;
      return str.trim().isEmpty() ? null : Double.parseDouble(str);
    }
    return null;
  }

  private Double calculateWeightDifference(User user) {
    if (user.getCurrentWeightKg() == null || user.getTargetWeightKg() == null) {
      return null;
    }
    return user.getCurrentWeightKg() - user.getTargetWeightKg();
  }

  private String getBMICategory(double bmi) {
    if (bmi == 0.0) return "Unknown";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25.0) return "Normal weight";
    if (bmi < 30.0) return "Overweight";
    return "Obese";
  }
}