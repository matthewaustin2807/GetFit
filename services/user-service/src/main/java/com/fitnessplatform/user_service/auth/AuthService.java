package com.fitnessplatform.user_service.auth;

import com.fitnessplatform.user_service.user.User;
import com.fitnessplatform.user_service.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Optional;

@Service
public class AuthService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  // Basic registration (for backward compatibility)
  public User registerUser(String username, String email, String password, String dateOfBirthString) {
    if (userRepository.existsByEmail(email)) {
      throw new RuntimeException("Email already exists");
    }

    LocalDate dateOfBirth = null;
    if (dateOfBirthString != null && !dateOfBirthString.trim().isEmpty()) {
      try {
        dateOfBirth = LocalDate.parse(dateOfBirthString);
      } catch (DateTimeParseException e) {
        throw new RuntimeException("Invalid date format. Please use YYYY-MM-DD");
      }
    }

    String hashedPassword = passwordEncoder.encode(password);
    User user = new User(username, email, hashedPassword);
    user.setDateOfBirth(dateOfBirth);

    return userRepository.save(user);
  }

  // Enhanced registration with full profile
  public User registerUserWithProfile(String username, String email, String password,
                                      String dateOfBirthString, Integer heightCm,
                                      Double currentWeightKg, String genderString,
                                      String activityLevelString, String fitnessGoalString,
                                      Double targetWeightKg, String preferredUnits) {

    if (userRepository.existsByEmail(email)) {
      throw new RuntimeException("Email already exists");
    }

    // Parse date of birth
    LocalDate dateOfBirth = null;
    if (dateOfBirthString != null && !dateOfBirthString.trim().isEmpty()) {
      try {
        dateOfBirth = LocalDate.parse(dateOfBirthString);
      } catch (DateTimeParseException e) {
        throw new RuntimeException("Invalid date format. Please use YYYY-MM-DD");
      }
    }

    // Parse enums
    User.Gender gender = parseGender(genderString);
    User.ActivityLevel activityLevel = parseActivityLevel(activityLevelString);
    User.FitnessGoal fitnessGoal = parseFitnessGoal(fitnessGoalString);

    // Hash password
    String hashedPassword = passwordEncoder.encode(password);

    // Create user with full profile
    User user = new User(username, email, hashedPassword, dateOfBirth, heightCm,
        currentWeightKg, gender, activityLevel, fitnessGoal,
        targetWeightKg, preferredUnits);

    return userRepository.save(user);
  }

  // Login method remains the same
  public User loginUser(String email, String password) {
    Optional<User> userOptional = userRepository.findByEmail(email);
    if (userOptional.isEmpty()) {
      throw new RuntimeException("Invalid email or password");
    }

    User user = userOptional.get();

    if (!passwordEncoder.matches(password, user.getPassword())) {
      throw new RuntimeException("Invalid email or password");
    }

    return user;
  }

  // Update user profile
  public User updateUserProfile(Long userId, String name, Integer heightCm,
                                Double currentWeightKg, String genderString,
                                String activityLevelString, String fitnessGoalString,
                                Double targetWeightKg, String preferredUnits, String timezone) {

    Optional<User> userOptional = userRepository.findById(userId);
    if (userOptional.isEmpty()) {
      throw new RuntimeException("User not found");
    }

    User user = userOptional.get();

    // Update fields if provided
    if (name != null && !name.trim().isEmpty()) {
      user.setName(name.trim());
    }
    if (heightCm != null && heightCm > 0) {
      user.setHeightCm(heightCm);
    }
    if (currentWeightKg != null && currentWeightKg > 0) {
      user.setCurrentWeightKg(currentWeightKg);
    }
    if (genderString != null) {
      user.setGender(parseGender(genderString));
    }
    if (activityLevelString != null) {
      user.setActivityLevel(parseActivityLevel(activityLevelString));
    }
    if (fitnessGoalString != null) {
      user.setFitnessGoal(parseFitnessGoal(fitnessGoalString));
    }
    if (targetWeightKg != null && targetWeightKg > 0) {
      user.setTargetWeightKg(targetWeightKg);
    }
    if (preferredUnits != null) {
      user.setPreferredUnits(preferredUnits);
    }
    if (timezone != null) {
      user.setTimezone(timezone);
    }

    return userRepository.save(user);
  }

  // Get user profile
  public User getUserProfile(Long userId) {
    return userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));
  }

  // Get user by email
  public User getUserByEmail(String email) {
    return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Email not found: " + email));
  }

  // Verify password for sensitive operations
  public boolean verifyPassword(String email, String password) {
    try {
      User user = loginUser(email, password);
      return true; // If login succeeds, password is correct
    } catch (Exception e) {
      return false; // If login fails, password is incorrect
    }
  }

  // Update password
  public void updatePassword(Long userId, String newPassword) {
    Optional<User> userOptional = userRepository.findById(userId);
    if (userOptional.isEmpty()) {
      throw new RuntimeException("User not found");
    }

    User user = userOptional.get();
    String hashedPassword = passwordEncoder.encode(newPassword);
    user.setPassword(hashedPassword);
    userRepository.save(user);
  }

  // Helper methods to parse enums safely
  private User.Gender parseGender(String genderString) {
    if (genderString == null || genderString.trim().isEmpty()) {
      return null;
    }
    try {
      return User.Gender.valueOf(genderString.toUpperCase());
    } catch (IllegalArgumentException e) {
      throw new RuntimeException("Invalid gender value: " + genderString);
    }
  }

  private User.ActivityLevel parseActivityLevel(String activityLevelString) {
    if (activityLevelString == null || activityLevelString.trim().isEmpty()) {
      return null;
    }
    try {
      return User.ActivityLevel.valueOf(activityLevelString.toUpperCase());
    } catch (IllegalArgumentException e) {
      throw new RuntimeException("Invalid activity level value: " + activityLevelString);
    }
  }

  private User.FitnessGoal parseFitnessGoal(String fitnessGoalString) {
    if (fitnessGoalString == null || fitnessGoalString.trim().isEmpty()) {
      return null;
    }
    try {
      return User.FitnessGoal.valueOf(fitnessGoalString.toUpperCase());
    } catch (IllegalArgumentException e) {
      throw new RuntimeException("Invalid fitness goal value: " + fitnessGoalString);
    }
  }
}