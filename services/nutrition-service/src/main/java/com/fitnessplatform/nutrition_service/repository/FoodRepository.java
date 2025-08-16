package com.fitnessplatform.nutrition_service.repository;

import com.fitnessplatform.nutrition_service.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {

  // Search foods by name (case-insensitive)
  @Query("SELECT f FROM Food f WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY f.name")
  List<Food> findByNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);

  // Find by barcode for scanning
  Optional<Food> findByBarcode(String barcode);

  boolean existsByBarcode(String barcode);

  // Find by brand
  List<Food> findByBrandContainingIgnoreCase(String brand);

  // Search by name and brand combined
  @Query("SELECT f FROM Food f WHERE " +
      "LOWER(f.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
      "LOWER(f.brand) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
      "ORDER BY f.name")
  List<Food> searchFoodsByNameOrBrand(@Param("searchTerm") String searchTerm);

  // Get popular foods (for suggestions)
  @Query("SELECT f FROM Food f ORDER BY f.name LIMIT 20")
  List<Food> findTop20PopularFoods();
}