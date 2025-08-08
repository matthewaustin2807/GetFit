package com.fitnessplatform.user_service.auth;

import com.fitnessplatform.user_service.jwt.JwtUtil;
import com.fitnessplatform.user_service.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

  @Autowired
  private AuthService authService;

  @Autowired
  private JwtUtil jwtUtil;

  // Basic registration (for backward compatibility)
  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody Map<String, Object> request) {
    try {
      String username = (String) request.get("username");
      String email = (String) request.get("email");
      String password = (String) request.get("password");
      String dateOfBirth = (String) request.get("dateOfBirth");

      User user = authService.registerUser(username, email, password, dateOfBirth);

      // Generate JWT tokens
      String accessToken = jwtUtil.generateToken(user);

      String refreshToken = jwtUtil.generateRefreshToken(user);

      return ResponseEntity.ok(createAuthResponse("User registered successfully", user, accessToken, refreshToken));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  // Enhanced registration with full profile
  @PostMapping("/register/full")
  public ResponseEntity<?> registerWithFullProfile(@RequestBody Map<String, Object> request) {
    try {
      String username = (String) request.get("username");
      String email = (String) request.get("email");
      String password = (String) request.get("password");
      String dateOfBirth = (String) request.get("dateOfBirth");

      // Physical profile
      Integer heightCm = parseInteger(request.get("heightCm"));
      Double currentWeightKg = parseDouble(request.get("currentWeightKg"));
      String gender = (String) request.get("gender");

      // Fitness profile
      String activityLevel = (String) request.get("activityLevel");
      String fitnessGoal = (String) request.get("fitnessGoal");
      Double targetWeightKg = parseDouble(request.get("targetWeightKg"));

      // Preferences
      String preferredUnits = (String) request.get("preferredUnits");

      User user = authService.registerUserWithProfile(
          username, email, password, dateOfBirth, heightCm, currentWeightKg,
          gender, activityLevel, fitnessGoal, targetWeightKg, preferredUnits
      );

      // Generate JWT tokens
      String accessToken = jwtUtil.generateToken(user);
      String refreshToken = jwtUtil.generateRefreshToken(user);

      return ResponseEntity.ok(createAuthResponse("User registered successfully", user, accessToken, refreshToken));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
    try {
      String email = request.get("email");
      String password = request.get("password");

      User user = authService.loginUser(email, password);

      // Generate JWT tokens
      String accessToken = jwtUtil.generateToken(user);
      String refreshToken = jwtUtil.generateRefreshToken(user);

      return ResponseEntity.ok(createAuthResponse("Login successful", user, accessToken, refreshToken));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  // Refresh access token using refresh token
  @PostMapping("/refresh")
  public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
    try {
      String refreshToken = request.get("refreshToken");

      if (refreshToken == null || refreshToken.trim().isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "Refresh token is required"));
      }

      // Validate refresh token
      if (!jwtUtil.validateToken(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired refresh token"));
      }

      // Extract user info from refresh token
      String email = jwtUtil.extractUsername(refreshToken);
      User user = authService.getUserByEmail(email);

      // Generate new access token
      String newAccessToken = jwtUtil.generateToken(user);

      return ResponseEntity.ok(Map.of(
          "message", "Token refreshed successfully",
          "accessToken", newAccessToken,
          "tokenType", "Bearer",
          "expiresIn", 86400 // 24 hours in seconds
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }
  // Logout (optional - for token blacklisting in future)
  @PostMapping("/logout")
  public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
    try {
      // For now, just return success
      // In production, you might want to blacklist the token
      return ResponseEntity.ok(Map.of("message", "Logged out successfully"));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
  }

  // Validate token endpoint (useful for mobile app)
  @PostMapping("/validate")
  public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
    try {
      if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid authorization header"));
      }

      String token = authHeader.substring(7);

      if (jwtUtil.validateToken(token)) {
        Long userId = jwtUtil.extractUserId(token);
        String email = jwtUtil.extractUsername(token);

        return ResponseEntity.ok(Map.of(
            "message", "Token is valid",
            "userId", userId,
            "email", email,
            "valid", true
        ));
      } else {
        return ResponseEntity.badRequest().body(Map.of(
            "error", "Token is invalid or expired",
            "valid", false
        ));
      }

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", "Token validation failed: " + e.getMessage(),
          "valid", false
      ));
    }
  }

  // Helper method to create consistent auth response with tokens
  private Map<String, Object> createAuthResponse(String message, User user, String accessToken, String refreshToken) {
    Map<String, Object> response = new HashMap<>();
    response.put("message", message);

    // User information
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
    userMap.put("preferredUnits", user.getPreferredUnits());
    userMap.put("timezone", user.getTimezone());
    userMap.put("age", user.getAge());
    userMap.put("bmi", user.getBMI());
    userMap.put("createdAt", user.getCreatedAt());

    response.put("user", userMap);

    // JWT tokens
    response.put("accessToken", accessToken);
    response.put("refreshToken", refreshToken);
    response.put("tokenType", "Bearer");
    response.put("expiresIn", 86400); // 24 hours in seconds

    return response;
  }


  // Helper method to create consistent user response
  private Map<String, Object> createUserResponse(String message, User user) {
    Map<String, Object> response = new HashMap<>();
    response.put("message", message);

    Map<String, Object> userMap = new HashMap<>();
    userMap.put("id", user.getId());
    userMap.put("name", user.getUsername());
    userMap.put("email", user.getEmail());
    userMap.put("dateOfBirth", user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null);
    userMap.put("heightCm", user.getHeightCm());
    userMap.put("currentWeightKg", user.getCurrentWeightKg());
    userMap.put("gender", user.getGender() != null ? user.getGender().toString() : null);
    userMap.put("activityLevel", user.getActivityLevel() != null ? user.getActivityLevel().toString() : null);
    userMap.put("fitnessGoal", user.getFitnessGoal() != null ? user.getFitnessGoal().toString() : null);
    userMap.put("targetWeightKg", user.getTargetWeightKg());
    userMap.put("preferredUnits", user.getPreferredUnits());
    userMap.put("timezone", user.getTimezone());
    userMap.put("age", user.getAge());
    userMap.put("bmi", user.getBMI());
    userMap.put("createdAt", user.getCreatedAt());

    response.put("user", userMap);
    return response;
  }

  // Helper methods for parsing request parameters
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
}