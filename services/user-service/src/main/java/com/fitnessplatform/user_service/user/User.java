package com.fitnessplatform.user_service.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true),
    @Index(name = "idx_user_created_at", columnList = "created_at")
})
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // Authentication fields
  @NotBlank(message = "Username is required")
  @Size(min = 2, max = 100, message = "Username must be between 2 and 100 characters")
  @Column(name = "username", nullable = false, length = 100)
  private String username;

  @Email(message = "Email must be valid")
  @NotBlank(message = "Email is required")
  @Size(max = 150, message = "Email must not exceed 150 characters")
  @Column(name = "email", nullable = false, unique = true, length = 150)
  private String email;

  @NotBlank(message = "Password is required")
  @Column(name = "password", nullable = false, length = 255)
  private String password;

  @Column(name = "date_of_birth")
  private LocalDate dateOfBirth;

  // Physical profile
  @Column(name = "height_cm")
  private Integer heightCm; // Height in centimeters

  @Column(name = "current_weight_kg")
  private Double currentWeightKg; // Current weight in kilograms

  @Enumerated(EnumType.STRING)
  @Column(name = "gender", length = 20)
  private Gender gender;

  // Fitness profile
  @Enumerated(EnumType.STRING)
  @Column(name = "activity_level", length = 20)
  private ActivityLevel activityLevel;

  @Enumerated(EnumType.STRING)
  @Column(name = "fitness_goal", length = 30)
  private FitnessGoal fitnessGoal;

  @Column(name = "target_weight_kg")
  private Double targetWeightKg; // Goal weight

  // Preferences
  @Column(name = "preferred_units", length = 10)
  private String preferredUnits; // "METRIC" or "IMPERIAL"

  @Column(name = "timezone", length = 50)
  private String timezone;

  // Account status
  @Column(name = "is_verified", nullable = false)
  private Boolean isVerified = false;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive = true;

  // Timestamps
  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  // Enums
  public enum Gender {
    MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
  }

  public enum ActivityLevel {
    SEDENTARY,           // Little to no exercise
    LIGHTLY_ACTIVE,      // Light exercise 1-3 days/week
    MODERATELY_ACTIVE,   // Moderate exercise 3-5 days/week
    VERY_ACTIVE,         // Hard exercise 6-7 days/week
    EXTREMELY_ACTIVE     // Very hard exercise, physical job
  }

  public enum FitnessGoal {
    LOSE_WEIGHT,
    GAIN_WEIGHT,
    MAINTAIN_WEIGHT,
    BUILD_MUSCLE,
    IMPROVE_ENDURANCE,
    GENERAL_FITNESS,
    STRENGTH_TRAINING
  }

  // Constructors
  public User() {}

  public User(String username, String email, String password) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.preferredUnits = "METRIC"; // Default to metric
  }

  // Full constructor
  public User(String username, String email, String password, LocalDate dateOfBirth,
              Integer heightCm, Double currentWeightKg, Gender gender,
              ActivityLevel activityLevel, FitnessGoal fitnessGoal,
              Double targetWeightKg, String preferredUnits) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.dateOfBirth = dateOfBirth;
    this.heightCm = heightCm;
    this.currentWeightKg = currentWeightKg;
    this.gender = gender;
    this.activityLevel = activityLevel;
    this.fitnessGoal = fitnessGoal;
    this.targetWeightKg = targetWeightKg;
    this.preferredUnits = preferredUnits != null ? preferredUnits : "METRIC";
  }

  // Getters and Setters
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getUsername() { return username; }
  public void setName(String name) { this.username = name; }

  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }

  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }

  public LocalDate getDateOfBirth() { return dateOfBirth; }
  public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

  public Integer getHeightCm() { return heightCm; }
  public void setHeightCm(Integer heightCm) { this.heightCm = heightCm; }

  public Double getCurrentWeightKg() { return currentWeightKg; }
  public void setCurrentWeightKg(Double currentWeightKg) { this.currentWeightKg = currentWeightKg; }

  public Gender getGender() { return gender; }
  public void setGender(Gender gender) { this.gender = gender; }

  public ActivityLevel getActivityLevel() { return activityLevel; }
  public void setActivityLevel(ActivityLevel activityLevel) { this.activityLevel = activityLevel; }

  public FitnessGoal getFitnessGoal() { return fitnessGoal; }
  public void setFitnessGoal(FitnessGoal fitnessGoal) { this.fitnessGoal = fitnessGoal; }

  public Double getTargetWeightKg() { return targetWeightKg; }
  public void setTargetWeightKg(Double targetWeightKg) { this.targetWeightKg = targetWeightKg; }

  public String getPreferredUnits() { return preferredUnits; }
  public void setPreferredUnits(String preferredUnits) { this.preferredUnits = preferredUnits; }

  public String getTimezone() { return timezone; }
  public void setTimezone(String timezone) { this.timezone = timezone; }

  public Boolean getIsVerified() { return isVerified; }
  public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

  public Boolean getIsActive() { return isActive; }
  public void setIsActive(Boolean isActive) { this.isActive = isActive; }

  public LocalDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

  public LocalDateTime getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

  // Helper methods
  public int getAge() {
    if (dateOfBirth == null) return 0;
    return LocalDate.now().getYear() - dateOfBirth.getYear();
  }

  public double getBMI() {
    if (heightCm == null || currentWeightKg == null) return 0.0;
    double heightM = heightCm / 100.0;
    return currentWeightKg / (heightM * heightM);
  }

  // Equals and HashCode
  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    User user = (User) o;
    return Objects.equals(id, user.id) && Objects.equals(email, user.email);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, email);
  }

  @Override
  public String toString() {
    return "User{" +
        "id=" + id +
        ", username='" + username + '\'' +
        ", email='" + email + '\'' +
        ", dateOfBirth=" + dateOfBirth +
        ", heightCm=" + heightCm +
        ", currentWeightKg=" + currentWeightKg +
        ", gender=" + gender +
        ", activityLevel=" + activityLevel +
        ", fitnessGoal=" + fitnessGoal +
        ", createdAt=" + createdAt +
        '}';
  }
}