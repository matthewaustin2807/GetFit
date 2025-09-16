package com.fitnessplatform.nutrition_service.service;

import com.fitnessplatform.nutrition_service.entity.WaterIntake;
import com.fitnessplatform.nutrition_service.repository.WaterIntakeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class WaterIntakeService {

  @Autowired
  private WaterIntakeRepository repository;

  @Transactional
  public WaterIntake logWater(Long userId, Double glasses, LocalDate date) {
    if (glasses <= 0) {
      throw new IllegalArgumentException("Water intake must be positive");
    }

    Optional<WaterIntake> existing = repository.findByUserIdAndIntakeDate(userId, date);

    if (existing.isPresent()) {
      // Add to existing day's intake
      WaterIntake intake = existing.get();
      BigDecimal newTotal = intake.getGlassesConsumed().add(BigDecimal.valueOf(glasses));
      intake.setGlassesConsumed(newTotal);
      return repository.save(intake);
    } else {
      // Create new entry for the day
      WaterIntake intake = new WaterIntake(userId, date, BigDecimal.valueOf(glasses));
      return repository.save(intake);
    }
  }

  public BigDecimal getTodayIntake(Long userId) {
    return repository.findByUserIdAndIntakeDate(userId, LocalDate.now())
        .map(WaterIntake::getGlassesConsumed)
        .orElse(BigDecimal.ZERO);
  }

  public List<WaterIntake> getWeeklyIntake(Long userId) {
    LocalDate weekAgo = LocalDate.now().minusDays(7);
    return repository.findRecentIntakeByUser(userId, weekAgo);
  }

  public BigDecimal getIntakeForDate(Long userId, LocalDate date) {
    return repository.findByUserIdAndIntakeDate(userId, date)
        .map(WaterIntake::getGlassesConsumed)
        .orElse(BigDecimal.ZERO);
  }
}
