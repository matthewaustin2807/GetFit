package com.fitnessplatform.nutrition_service.repository;

import com.fitnessplatform.nutrition_service.entity.WaterIntake;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaterIntakeRepository extends JpaRepository<WaterIntake, Long> {

  Optional<WaterIntake> findByUserIdAndIntakeDate(Long userId, LocalDate intakeDate);

  List<WaterIntake> findByUserIdAndIntakeDateBetween(
      Long userId, LocalDate startDate, LocalDate endDate
  );

  @Query("SELECT w FROM WaterIntake w WHERE w.userId = :userId AND w.intakeDate >= :startDate ORDER BY w.intakeDate DESC")
  List<WaterIntake> findRecentIntakeByUser(Long userId, LocalDate startDate);
}