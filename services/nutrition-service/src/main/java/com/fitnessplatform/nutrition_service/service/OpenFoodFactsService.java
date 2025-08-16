package com.fitnessplatform.nutrition_service.service;

import com.fitnessplatform.nutrition_service.entity.Food;
import com.fitnessplatform.nutrition_service.entity.FoodNutrition;
import com.fitnessplatform.nutrition_service.repository.FoodRepository;
import com.fitnessplatform.nutrition_service.repository.FoodNutritionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

@Service
public class OpenFoodFactsService {

  @Autowired
  private FoodRepository foodRepository;

  @Autowired
  private FoodNutritionRepository nutritionRepository;

  private final RestTemplate restTemplate = new RestTemplate();
  private final String OFF_API_BASE = "https://world.openfoodfacts.org/api/v2/product/";

  public void importCommonFoodsFromAPI() {
    // List of common food barcodes to import
    List<String> commonBarcodes = Arrays.asList(
        "3017624010701", // Nutella (verified)
        "5449000000996", // Coca-Cola (verified)
        "7622210951502", // Oreo Original
        "8712566441235", // Red Bull
        "4902102072373", // Kit Kat
        "8714100770269", // Heineken
        "3229820129488", // Evian Water
        "3033710065967", // Perrier
        "8076800195057", // Pringles Original
        "5000159407236"  // Snickers
    );

    int imported = 0;
    for (String barcode : commonBarcodes) {
      try {
        if (importFoodByBarcode(barcode)) {
          imported++;
        }
        Thread.sleep(100); // Be nice to the API
      } catch (Exception e) {
        System.out.println("Failed to import " + barcode + ": " + e.getMessage());
      }
    }

    System.out.println("Imported " + imported + " foods from Open Food Facts");
  }

  public boolean importFoodByBarcode(String barcode) {
    try {
      String url = OFF_API_BASE + barcode + ".json";

      @SuppressWarnings("unchecked")
      Map<String, Object> response = restTemplate.getForObject(url, Map.class);

      if (response != null && "1".equals(String.valueOf(response.get("status")))) {
        @SuppressWarnings("unchecked")
        Map<String, Object> product = (Map<String, Object>) response.get("product");

        if (product != null) {
          return createFoodFromOFFData(product, barcode);
        }
      }

      return false;

    } catch (Exception e) {
      System.out.println("Error importing food " + barcode + ": " + e.getMessage());
      return false;
    }
  }

  private boolean createFoodFromOFFData(Map<String, Object> product, String barcode) {
    try {
      // Extract basic food info
      String productName = getStringValue(product, "product_name");
      String brand = getStringValue(product, "brands");

      if (productName == null || productName.trim().isEmpty()) {
        return false;
      }

      // Create food entity
      Food food = new Food(productName, brand, barcode);
      Food savedFood = foodRepository.save(food);

      // Extract nutrition data
      @SuppressWarnings("unchecked")
      Map<String, Object> nutriments = (Map<String, Object>) product.get("nutriments");

      if (nutriments != null) {
        // Extract macronutrients (all per 100g)
        Double calories = getDoubleValue(nutriments, "energy-kcal_100g");
        Double protein = getDoubleValue(nutriments, "proteins_100g");
        Double carbs = getDoubleValue(nutriments, "carbohydrates_100g");
        Double fat = getDoubleValue(nutriments, "fat_100g");
        Double fiber = getDoubleValue(nutriments, "fiber_100g");
        Double sugar = getDoubleValue(nutriments, "sugars_100g");
        Double sodium = getDoubleValue(nutriments, "sodium_100g");

        // Convert sodium from g to mg if needed
        if (sodium != null) {
          sodium = sodium * 1000; // Convert g to mg
        }

        // Create nutrition record if we have at least calories
        if (calories != null && calories > 0) {
          FoodNutrition nutrition = new FoodNutrition(
              savedFood.getId(),
              BigDecimal.valueOf(calories),
              BigDecimal.valueOf(protein != null ? protein : 0.0),
              BigDecimal.valueOf(carbs != null ? carbs : 0.0),
              BigDecimal.valueOf(fat != null ? fat : 0.0)
          );

          if (fiber != null) nutrition.setFiberG(BigDecimal.valueOf(fiber));
          if (sugar != null) nutrition.setSugarG(BigDecimal.valueOf(sugar));
          if (sodium != null) nutrition.setSodiumMg(BigDecimal.valueOf(sodium));

          nutritionRepository.save(nutrition);

          System.out.println("✅ Imported: " + productName + " (" + brand + ") - " +
              calories + " cal, " + protein + "g protein");
          return true;
        }
      }

      return false;

    } catch (Exception e) {
      System.out.println("Error creating food from OFF data: " + e.getMessage());
      return false;
    }
  }

  private String getStringValue(Map<String, Object> map, String key) {
    Object value = map.get(key);
    return value != null ? value.toString().trim() : null;
  }

  private Double getDoubleValue(Map<String, Object> map, String key) {
    Object value = map.get(key);
    if (value == null) return null;

    try {
      if (value instanceof Number) {
        return ((Number) value).doubleValue();
      } else if (value instanceof String) {
        String str = value.toString().trim();
        return str.isEmpty() ? null : Double.parseDouble(str);
      }
    } catch (NumberFormatException e) {
      return null;
    }

    return null;
  }
}