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
import java.util.stream.Collectors;

@Service
public class FoodSearchService {

  @Autowired
  private FoodRepository foodRepository;

  @Autowired
  private FoodNutritionRepository nutritionRepository;

  @Autowired
  private RestTemplate restTemplate;

  private final String OFF_API_BASE = "https://world.openfoodfacts.org/api/v2/";

  public Map<String, Object> searchFoods(String query, int limit) {
    List<Map<String, Object>> results = new ArrayList<>();

    // 1. Search local database first (fastest)
    List<Food> localFoods = foodRepository.searchFoodsByNameOrBrand(query);

    for (Food food : localFoods.stream().limit(limit).collect(Collectors.toList())) {
      Optional<FoodNutrition> nutrition = nutritionRepository.findByFoodId(food.getId());

      Map<String, Object> foodData = createFoodResponse(food, nutrition.orElse(null));
      foodData.put("source", "local");
      foodData.put("available_offline", true);
      results.add(foodData);
    }

    // 2. If we don't have enough local results, search API and auto-cache
    if (results.size() < limit) {
      try {
        List<Map<String, Object>> apiResults = searchAndCacheFromAPI(query, limit - results.size());
        results.addAll(apiResults);
      } catch (Exception e) {
        System.out.println("API search failed: " + e.getMessage());
      }
    }

    return Map.of(
        "query", query,
        "total_results", results.size(),
        "local_results", localFoods.size(),
        "cached_new", results.size() - localFoods.size(), // How many new foods were cached
        "foods", results
    );
  }

  public Map<String, Object> getFoodByBarcode(String barcode) {
    // 1. Check local database first
    Optional<Food> localFood = foodRepository.findByBarcode(barcode);
    if (localFood.isPresent()) {
      Optional<FoodNutrition> nutrition = nutritionRepository.findByFoodId(localFood.get().getId());
      Map<String, Object> foodData = createFoodResponse(localFood.get(), nutrition.orElse(null));
      foodData.put("source", "local");
      foodData.put("available_offline", true);
      return foodData;
    }

    // 2. Search Open Food Facts API
    try {
      return getFoodFromOpenFoodFacts(barcode);
    } catch (Exception e) {
      throw new RuntimeException("Food not found: " + barcode);
    }
  }

  public Map<String, Object> saveAndCacheFoodFromAPI(String barcode) {
    try {
      // Get food from API
      Map<String, Object> apiFood = getFoodFromOpenFoodFacts(barcode);

      // Save to local database for faster future access
      Food localFood = createFoodFromAPIData(apiFood, barcode);
      Optional<FoodNutrition> nutrition = nutritionRepository.findByFoodId(localFood.getId());

      Map<String, Object> result = createFoodResponse(localFood, nutrition.orElse(null));
      result.put("source", "cached");
      result.put("message", "Food cached locally for faster access");

      return result;

    } catch (Exception e) {
      throw new RuntimeException("Failed to cache food: " + e.getMessage());
    }
  }

  @SuppressWarnings("unchecked")
  private List<Map<String, Object>> searchAndCacheFromAPI(String query, int limit) {
    List<Map<String, Object>> results = new ArrayList<>();

    try {
      String url = OFF_API_BASE + "search?search_terms=" + query +
          "&page_size=" + Math.min(limit, 20) +
          "&fields=code,product_name,brands,nutriments";

      Map<String, Object> response = restTemplate.getForObject(url, Map.class);

      if (response != null) {
        List<Map<String, Object>> products = (List<Map<String, Object>>) response.get("products");

        if (products != null) {
          for (Map<String, Object> product : products) {
            try {
              // Get food data from API
              Map<String, Object> foodData = createAPIFoodResponse(product);

              if (foodData != null) {
                // AUTO-CACHE: Save good foods with nutrition to local database
                if ((Boolean) foodData.getOrDefault("hasNutrition", false)) {
                  String barcode = (String) foodData.get("barcode");

                  // Check if we already have this food locally
                  if (!foodRepository.existsByBarcode(barcode)) {
                    Food cachedFood = createFoodFromAPIData(foodData, barcode);
                    System.out.println("🔄 Auto-cached: " + foodData.get("name"));

                    // Update response to show it's now local
                    Optional<FoodNutrition> nutrition = nutritionRepository.findByFoodId(cachedFood.getId());
                    foodData = createFoodResponse(cachedFood, nutrition.orElse(null));
                    foodData.put("source", "auto-cached");
                    foodData.put("available_offline", true);
                  }
                }

                results.add(foodData);
              }

            } catch (Exception e) {
              System.out.println("Failed to cache food during search: " + e.getMessage());
              // Continue with other foods
            }
          }
        }
      }

    } catch (Exception e) {
      System.out.println("Open Food Facts search error: " + e.getMessage());
    }

    return results;
  }

  private Map<String, Object> createFoodResponse(Food food, FoodNutrition nutrition) {
    Map<String, Object> foodData = new HashMap<>();

    // Basic food info
    foodData.put("id", food.getId());
    foodData.put("name", food.getName());
    foodData.put("brand", food.getBrand());
    foodData.put("barcode", food.getBarcode());

    // Nutrition data if available
    if (nutrition != null) {
      Map<String, Object> nutritionData = new HashMap<>();
      nutritionData.put("calories", nutrition.getCalories());
      nutritionData.put("protein", nutrition.getProteinG());
      nutritionData.put("carbs", nutrition.getCarbsG());
      nutritionData.put("fat", nutrition.getFatG());
      nutritionData.put("fiber", nutrition.getFiberG());
      nutritionData.put("sugar", nutrition.getSugarG());
      nutritionData.put("sodium", nutrition.getSodiumMg());
      nutritionData.put("unit", "per 100g");

      foodData.put("nutrition", nutritionData);
      foodData.put("hasNutrition", true);
    } else {
      foodData.put("hasNutrition", false);
    }

    return foodData;
  }

  @SuppressWarnings("unchecked")
  private List<Map<String, Object>> searchOpenFoodFacts(String query, int limit) {
    List<Map<String, Object>> results = new ArrayList<>();

    try {
      String url = OFF_API_BASE + "search?search_terms=" + query +
          "&page_size=" + Math.min(limit, 20) +
          "&fields=code,product_name,brands,nutriments";

      Map<String, Object> response = restTemplate.getForObject(url, Map.class);

      if (response != null) {
        List<Map<String, Object>> products = (List<Map<String, Object>>) response.get("products");

        if (products != null) {
          for (Map<String, Object> product : products) {
            Map<String, Object> foodData = createAPIFoodResponse(product);
            if (foodData != null) {
              results.add(foodData);
            }
          }
        }
      }

    } catch (Exception e) {
      System.out.println("Open Food Facts search error: " + e.getMessage());
    }

    return results;
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> getFoodFromOpenFoodFacts(String barcode) {
    String url = OFF_API_BASE + "product/" + barcode + ".json";

    Map<String, Object> response = restTemplate.getForObject(url, Map.class);

    if (response != null && "1".equals(String.valueOf(response.get("status")))) {
      Map<String, Object> product = (Map<String, Object>) response.get("product");
      return createAPIFoodResponse(product);
    }

    throw new RuntimeException("Product not found in Open Food Facts");
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> createAPIFoodResponse(Map<String, Object> product) {
    try {
      String name = getStringValue(product, "product_name");
      String brand = getStringValue(product, "brands");
      String barcode = getStringValue(product, "code");

      if (name == null || name.trim().isEmpty()) {
        return null;
      }

      Map<String, Object> foodData = new HashMap<>();
      foodData.put("name", name);
      foodData.put("brand", brand);
      foodData.put("barcode", barcode);
      foodData.put("source", "api");
      foodData.put("available_offline", false);

      // Extract nutrition data (all per 100g)
      Map<String, Object> nutriments = (Map<String, Object>) product.get("nutriments");
      if (nutriments != null) {
        Map<String, Object> nutrition = new HashMap<>();

        Double calories = getDoubleValue(nutriments, "energy-kcal_100g");
        Double protein = getDoubleValue(nutriments, "proteins_100g");
        Double carbs = getDoubleValue(nutriments, "carbohydrates_100g");
        Double fat = getDoubleValue(nutriments, "fat_100g");
        Double fiber = getDoubleValue(nutriments, "fiber_100g");
        Double sugar = getDoubleValue(nutriments, "sugars_100g");
        Double sodium = getDoubleValue(nutriments, "sodium_100g");

        // Convert sodium from g to mg if needed
        if (sodium != null) sodium = sodium * 1000;

        nutrition.put("calories", calories);
        nutrition.put("protein", protein);
        nutrition.put("carbs", carbs);
        nutrition.put("fat", fat);
        nutrition.put("fiber", fiber);
        nutrition.put("sugar", sugar);
        nutrition.put("sodium", sodium);
        nutrition.put("unit", "per 100g");

        foodData.put("nutrition", nutrition);
        foodData.put("hasNutrition", calories != null);
      } else {
        foodData.put("hasNutrition", false);
      }

      return foodData;

    } catch (Exception e) {
      System.out.println("Error creating API food response: " + e.getMessage());
      return null;
    }
  }

  private Food createFoodFromAPIData(Map<String, Object> apiFood, String barcode) {
    String name = (String) apiFood.get("name");
    String brand = (String) apiFood.get("brand");

    Food food = new Food(name, brand, barcode);
    Food savedFood = foodRepository.save(food);

    // Save nutrition data if available
    @SuppressWarnings("unchecked")
    Map<String, Object> nutrition = (Map<String, Object>) apiFood.get("nutrition");
    if (nutrition != null && (Boolean) apiFood.get("hasNutrition")) {
      FoodNutrition foodNutrition = new FoodNutrition(
          savedFood.getId(),
          BigDecimal.valueOf(getDoubleOrZero(nutrition, "calories")),
          BigDecimal.valueOf(getDoubleOrZero(nutrition, "protein")),
          BigDecimal.valueOf(getDoubleOrZero(nutrition, "carbs")),
          BigDecimal.valueOf(getDoubleOrZero(nutrition, "fat"))
      );

      if (nutrition.get("fiber") != null) {
        foodNutrition.setFiberG(BigDecimal.valueOf((Double) nutrition.get("fiber")));
      }
      if (nutrition.get("sugar") != null) {
        foodNutrition.setSugarG(BigDecimal.valueOf((Double) nutrition.get("sugar")));
      }
      if (nutrition.get("sodium") != null) {
        foodNutrition.setSodiumMg(BigDecimal.valueOf((Double) nutrition.get("sodium")));
      }

      nutritionRepository.save(foodNutrition);
    }

    return savedFood;
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

  private Double getDoubleOrZero(Map<String, Object> map, String key) {
    Double value = getDoubleValue(map, key);
    return value != null ? value : 0.0;
  }
}