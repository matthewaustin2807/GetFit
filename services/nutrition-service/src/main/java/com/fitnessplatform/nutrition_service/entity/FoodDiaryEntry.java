package com.fitnessplatform.nutrition_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_diary_entries", indexes = {
    @Index(name = "idx_diary_user_date", columnList = "user_id, entry_date"),
    @Index(name = "idx_diary_user_meal", columnList = "user_id, meal_type"),
    @Index(name = "idx_diary_date", columnList = "entry_date")
})
public class FoodDiaryEntry {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull(message = "User ID is required")
  @Column(name = "user_id", nullable = false)
  private Long userId;

  @NotNull(message = "Food ID is required")
  @Column(name = "food_id", nullable = false)
  private Long foodId;

  @NotNull(message = "Entry date is required")
  @Column(name = "entry_date", nullable = false)
  private LocalDate entryDate;

  @Enumerated(EnumType.STRING)
  @Column(name = "meal_type", nullable = false, length = 20)
  private MealType mealType;

  @DecimalMin(value = "0.1", message = "Quantity must be greater than 0")
  @Column(name = "quantity_grams", precision = 8, scale = 2, nullable = false)
  private BigDecimal quantityGrams;

  // Calculated nutrition values (stored for performance)
  @Column(name = "calories_consumed", precision = 8, scale = 2)
  private BigDecimal caloriesConsumed;

  @Column(name = "protein_consumed", precision = 8, scale = 2)
  private BigDecimal proteinConsumed;

  @Column(name = "carbs_consumed", precision = 8, scale = 2)
  private BigDecimal carbsConsumed;

  @Column(name = "fat_consumed", precision = 8, scale = 2)
  private BigDecimal fatConsumed;

  @Column(name = "fiber_consumed", precision = 8, scale = 2)
  private BigDecimal fiberConsumed;

  @Column(name = "sugar_consumed", precision = 8, scale = 2)
  private BigDecimal sugarConsumed;

  @Column(name = "sodium_consumed", precision = 8, scale = 2)
  private BigDecimal sodiumConsumed;

  // Optional fields
  @Column(name = "notes", length = 500)
  private String notes;

  @Column(name = "photo_url", length = 255)
  private String photoUrl; // For future photo logging feature

  @Column(name = "is_recipe", nullable = false)
  private Boolean isRecipe = false; // For future recipe logging

  @CreationTimestamp
  @Column(name = "logged_at", nullable = false, updatable = false)
  private LocalDateTime loggedAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  // Meal Types Enum
  public enum MealType {
    BREAKFAST, LUNCH, DINNER, SNACK, OTHER
  }

  // Constructors
  public FoodDiaryEntry() {}

  public FoodDiaryEntry(Long userId, Long foodId, LocalDate entryDate,
                        MealType mealType, BigDecimal quantityGrams) {
    this.userId = userId;
    this.foodId = foodId;
    this.entryDate = entryDate;
    this.mealType = mealType;
    this.quantityGrams = quantityGrams;
  }

  // Getters and Setters
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public Long getUserId() { return userId; }
  public void setUserId(Long userId) { this.userId = userId; }

  public Long getFoodId() { return foodId; }
  public void setFoodId(Long foodId) { this.foodId = foodId; }

  public LocalDate getEntryDate() { return entryDate; }
  public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }

  public MealType getMealType() { return mealType; }
  public void setMealType(MealType mealType) { this.mealType = mealType; }

  public BigDecimal getQuantityGrams() { return quantityGrams; }
  public void setQuantityGrams(BigDecimal quantityGrams) { this.quantityGrams = quantityGrams; }

  public BigDecimal getCaloriesConsumed() { return caloriesConsumed; }
  public void setCaloriesConsumed(BigDecimal caloriesConsumed) { this.caloriesConsumed = caloriesConsumed; }

  public BigDecimal getProteinConsumed() { return proteinConsumed; }
  public void setProteinConsumed(BigDecimal proteinConsumed) { this.proteinConsumed = proteinConsumed; }

  public BigDecimal getCarbsConsumed() { return carbsConsumed; }
  public void setCarbsConsumed(BigDecimal carbsConsumed) { this.carbsConsumed = carbsConsumed; }

  public BigDecimal getFatConsumed() { return fatConsumed; }
  public void setFatConsumed(BigDecimal fatConsumed) { this.fatConsumed = fatConsumed; }

  public BigDecimal getFiberConsumed() { return fiberConsumed; }
  public void setFiberConsumed(BigDecimal fiberConsumed) { this.fiberConsumed = fiberConsumed; }

  public BigDecimal getSugarConsumed() { return sugarConsumed; }
  public void setSugarConsumed(BigDecimal sugarConsumed) { this.sugarConsumed = sugarConsumed; }

  public BigDecimal getSodiumConsumed() { return sodiumConsumed; }
  public void setSodiumConsumed(BigDecimal sodiumConsumed) { this.sodiumConsumed = sodiumConsumed; }

  public String getNotes() { return notes; }
  public void setNotes(String notes) { this.notes = notes; }

  public String getPhotoUrl() { return photoUrl; }
  public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

  public Boolean getIsRecipe() { return isRecipe; }
  public void setIsRecipe(Boolean isRecipe) { this.isRecipe = isRecipe; }

  public LocalDateTime getLoggedAt() { return loggedAt; }
  public void setLoggedAt(LocalDateTime loggedAt) { this.loggedAt = loggedAt; }

  public LocalDateTime getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}