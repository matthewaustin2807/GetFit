package com.fitnessplatform.nutrition_service.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_intake",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "intake_date"}),
    indexes = @Index(name = "idx_water_user_date", columnList = "user_id, intake_date")
)
public class WaterIntake {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "intake_date", nullable = false)
  private LocalDate intakeDate;

  @Column(name = "glasses_consumed", precision = 4, scale = 1, nullable = false)
  private BigDecimal glassesConsumed;

  @CreationTimestamp
  @Column(name = "logged_at", nullable = false, updatable = false)
  private LocalDateTime loggedAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  // Constructors
  public WaterIntake() {}

  public WaterIntake(Long userId, LocalDate intakeDate, BigDecimal glassesConsumed) {
    this.userId = userId;
    this.intakeDate = intakeDate;
    this.glassesConsumed = glassesConsumed;
  }

  // Getters and Setters
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public Long getUserId() { return userId; }
  public void setUserId(Long userId) { this.userId = userId; }

  public LocalDate getIntakeDate() { return intakeDate; }
  public void setIntakeDate(LocalDate intakeDate) { this.intakeDate = intakeDate; }

  public BigDecimal getGlassesConsumed() { return glassesConsumed; }
  public void setGlassesConsumed(BigDecimal glassesConsumed) { this.glassesConsumed = glassesConsumed; }

  public LocalDateTime getLoggedAt() { return loggedAt; }
  public LocalDateTime getUpdatedAt() { return updatedAt; }
}