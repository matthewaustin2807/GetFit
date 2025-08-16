package com.fitnessplatform.nutrition_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_nutrition")
public class FoodNutrition {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull
  @Column(name = "food_id", nullable = false)
  private Long foodId;

  // Remove @DecimalMin constraints - handle validation in service layer
  @Column(name = "calories", precision = 8, scale = 2, nullable = false)
  private BigDecimal calories;

  @Column(name = "protein_g", precision = 8, scale = 2, nullable = false)
  private BigDecimal proteinG;

  @Column(name = "carbs_g", precision = 8, scale = 2, nullable = false)
  private BigDecimal carbsG;

  @Column(name = "fat_g", precision = 8, scale = 2, nullable = false)
  private BigDecimal fatG;

  @Column(name = "fiber_g", precision = 8, scale = 2)
  private BigDecimal fiberG;

  @Column(name = "sugar_g", precision = 8, scale = 2)
  private BigDecimal sugarG;

  @Column(name = "sodium_mg", precision = 8, scale = 2)
  private BigDecimal sodiumMg;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  // Constructors remain the same
  public FoodNutrition() {}

  public FoodNutrition(Long foodId, BigDecimal calories, BigDecimal proteinG,
                       BigDecimal carbsG, BigDecimal fatG) {
    this.foodId = foodId;
    this.calories = calories;
    this.proteinG = proteinG;
    this.carbsG = carbsG;
    this.fatG = fatG;
  }

  // Helper methods for nutrition calculations
  public BigDecimal calculateCaloriesFor(BigDecimal grams) {
    return calories.multiply(grams).divide(new BigDecimal("100"));
  }

  public BigDecimal calculateProteinFor(BigDecimal grams) {
    return proteinG.multiply(grams).divide(new BigDecimal("100"));
  }

  public BigDecimal calculateCarbsFor(BigDecimal grams) {
    return carbsG.multiply(grams).divide(new BigDecimal("100"));
  }

  public BigDecimal calculateFatFor(BigDecimal grams) {
    return fatG.multiply(grams).divide(new BigDecimal("100"));
  }

  // Getters and Setters
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public Long getFoodId() { return foodId; }
  public void setFoodId(Long foodId) { this.foodId = foodId; }

  public BigDecimal getCalories() { return calories; }
  public void setCalories(BigDecimal calories) { this.calories = calories; }

  public BigDecimal getProteinG() { return proteinG; }
  public void setProteinG(BigDecimal proteinG) { this.proteinG = proteinG; }

  public BigDecimal getCarbsG() { return carbsG; }
  public void setCarbsG(BigDecimal carbsG) { this.carbsG = carbsG; }

  public BigDecimal getFatG() { return fatG; }
  public void setFatG(BigDecimal fatG) { this.fatG = fatG; }

  public BigDecimal getFiberG() { return fiberG; }
  public void setFiberG(BigDecimal fiberG) { this.fiberG = fiberG; }

  public BigDecimal getSugarG() { return sugarG; }
  public void setSugarG(BigDecimal sugarG) { this.sugarG = sugarG; }

  public BigDecimal getSodiumMg() { return sodiumMg; }
  public void setSodiumMg(BigDecimal sodiumMg) { this.sodiumMg = sodiumMg; }

  public LocalDateTime getCreatedAt() { return createdAt; }
  public LocalDateTime getUpdatedAt() { return updatedAt; }
}