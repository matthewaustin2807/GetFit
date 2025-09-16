package com.fitnessplatform.nutrition_service.service;

import com.fitnessplatform.nutrition_service.config.OpenFoodFactsConfig;
import com.fitnessplatform.nutrition_service.entity.Food;
import com.fitnessplatform.nutrition_service.entity.FoodNutrition;
import com.fitnessplatform.nutrition_service.repository.FoodRepository;
import com.fitnessplatform.nutrition_service.repository.FoodNutritionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@Service
public class FoodSearchService {

  @Autowired
  private FoodRepository foodRepository;

  @Autowired
  private FoodNutritionRepository nutritionRepository;

  @Autowired
  private RestTemplate restTemplate;

  @Autowired
  private OpenFoodFactsConfig config;

  // Rate limiting tracking
  private final AtomicLong lastSearchRequest = new AtomicLong(0);
  private final AtomicLong lastProductRequest = new AtomicLong(0);

  // Rate limits in milliseconds (from API documentation)
  private static final long SEARCH_RATE_LIMIT = 6100; // 10 req/min = 6000ms + buffer
  private static final long PRODUCT_RATE_LIMIT = 700;  // 100 req/min = 600ms + buffer

  @SuppressWarnings("unchecked")
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

    // 2. If we don't have enough local results, search Search-a-licious API
    if (results.size() < limit) {
      try {
        // Enforce rate limiting for search queries
        enforceRateLimit(SEARCH_RATE_LIMIT, lastSearchRequest);

        List<Map<String, Object>> apiResults = searchFromSearchALicious(query, limit - results.size());
        results.addAll(apiResults);
      } catch (Exception e) {
        System.out.println("Search-a-licious API search failed: " + e.getMessage());
      }
    }

    return Map.of(
        "query", query,
        "total_results", results.size(),
        "local_results", localFoods.size(),
        "cached_new", results.size() - localFoods.size(),
        "foods", results,
        "api_used", "search_a_licious"
    );
  }

  public Map<String, Object> searchByBarcode(String barcode) {
    try {
      // 1. Search local database first
      Optional<Food> localFood = foodRepository.findByBarcode(barcode);
      if (localFood.isPresent()) {
        Optional<FoodNutrition> nutrition = nutritionRepository.findByFoodId(localFood.get().getId());
        Map<String, Object> foodData = createFoodResponse(localFood.get(), nutrition.orElse(null));
        foodData.put("source", "local");
        foodData.put("available_offline", true);

        System.out.println("✅ Found barcode " + barcode + " in local database");
        return Map.of(
            "barcode", barcode,
            "found", true,
            "source", "local",
            "food", foodData
        );
      }

      // 2. Search Search-a-licious API if not found locally
      System.out.println("🔍 Barcode " + barcode + " not found locally, searching API...");
      enforceRateLimit(PRODUCT_RATE_LIMIT, lastProductRequest);

      Map<String, Object> apiResult = searchBarcodeFromOpenFoodFacts(barcode);
      // CHECK AGAIN: Maybe another thread cached it while we were doing API call

      if (apiResult != null) {
        String foundBarcode = (String) apiResult.get("barcode");

        // CHECK AGAIN: Maybe another thread cached it while we were doing API call
        Optional<Food> existingFood = foodRepository.findByBarcode(foundBarcode);
        if (existingFood.isPresent()) {
          System.out.println("⚠️ Food was cached by another request, returning existing");
          Optional<FoodNutrition> nutrition = nutritionRepository.findByFoodId(existingFood.get().getId());
          Map<String, Object> foodData = createFoodResponse(existingFood.get(), nutrition.orElse(null));
          foodData.put("source", "local");
          foodData.put("available_offline", true);

          return Map.of(
              "barcode", barcode,
              "found", true,
              "source", "cached_by_another_request",
              "food", foodData
          );
        }
        // Auto-cache the result
        if ((Boolean) apiResult.getOrDefault("hasNutrition", false)) {
          Food cachedFood = createAndSaveFoodFromAPI(apiResult);
          System.out.println("📄 Auto-cached barcode: " + barcode);

          // Return the cached version
          Optional<FoodNutrition> nutrition = nutritionRepository.findByFoodId(cachedFood.getId());
          Map<String, Object> foodData = createFoodResponse(cachedFood, nutrition.orElse(null));
          foodData.put("source", "auto-cached");
          foodData.put("available_offline", true);

          return Map.of(
              "barcode", barcode,
              "found", true,
              "source", "api_cached",
              "food", foodData
          );
        } else {
          // Return API result without caching
          return Map.of(
              "barcode", barcode,
              "found", true,
              "source", "api",
              "food", apiResult
          );
        }
      }

      // 3. Not found anywhere
      return Map.of(
          "barcode", barcode,
          "found", false,
          "message", "Product not found"
      );

    } catch (Exception e) {
      System.err.println("Barcode search failed: " + e.getMessage());
      return Map.of(
          "barcode", barcode,
          "found", false,
          "error", "Search failed: " + e.getMessage()
      );
    }
  }

  /**
   * Search using Search-a-licious API and auto-cache results
   */
  @SuppressWarnings("unchecked")
  private List<Map<String, Object>> searchFromSearchALicious(String query, int limit) {
    List<Map<String, Object>> results = new ArrayList<>();

    try {
      String encodedQuery = URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);

      // Search-a-licious API URL with fields needed for Food and FoodNutrition entities
      String url = "https://search.openfoodfacts.org/search" +
          "?q=" + encodedQuery +
          "&size=" + Math.min(limit, 20) +
          "&fields=code,product_name,brands,nutriments,unique_scans_n" +
          "&sort_by=-unique_scans_n"; // Sort by popularity

      System.out.println("🔍 Searching Search-a-licious: " + query);
      Map<String, Object> response = restTemplate.getForObject(url, Map.class);

      if (response != null && response.containsKey("hits")) {
        List<Map<String, Object>> hits = (List<Map<String, Object>>) response.get("hits");

        if (hits != null) {
          System.out.println("✅ Found " + hits.size() + " results from Search-a-licious");

          for (Map<String, Object> hit : hits) {
            try {
              Map<String, Object> foodData = createFoodDataFromSearchALicious(hit);
              if (foodData != null) {
                // AUTO-CACHE: Save foods with nutrition to local database
                if ((Boolean) foodData.getOrDefault("hasNutrition", false)) {
                  String barcode = (String) foodData.get("barcode");
                  if (foodRepository.existsByBarcode(barcode)) {
                    Optional<Food> existingFoodOpt = foodRepository.findByBarcode(barcode);

                    if (existingFoodOpt.isPresent()) {
                      Food existingFood = existingFoodOpt.get();
                      // Return existing cached food with ID
                      Optional<FoodNutrition> nutrition = nutritionRepository.findByFoodId(existingFood.getId());
                      foodData = createFoodResponse(existingFood, nutrition.orElse(null));
                    }
                  } else if (barcode != null) {
                      Food cachedFood = createAndSaveFoodFromAPI(foodData);
                      System.out.println("📄 Auto-cached: " + foodData.get("name"));

                      // UPDATE: Return the cached food with database ID
                      Optional<FoodNutrition> nutrition = nutritionRepository.findByFoodId(cachedFood.getId());
                      foodData = createFoodResponse(cachedFood, nutrition.orElse(null));
                      foodData.put("source", "auto-cached");
                      foodData.put("available_offline", true);
                      foodData.put("id", cachedFood.getId());
                  }
                }
                results.add(foodData);
              }
            } catch (Exception e) {
              System.out.println("Failed to process Search-a-licious result: " + e.getMessage());
            }
          }
        }
      }

    } catch (Exception e) {
      System.err.println("Search-a-licious error: " + e.getMessage());
      throw new RuntimeException("Search temporarily unavailable: " + e.getMessage());
    }

    return results;
  }

  /**
   * Search barcode using Search-a-licious API
   */
  @SuppressWarnings("unchecked")
  private Map<String, Object> searchBarcodeFromOpenFoodFacts(String barcode) {
    try {
      // Use official Open Food Facts API v2 endpoint
      String url = "https://world.openfoodfacts.net/api/v2/product/" + barcode +
          "?fields=code,product_name,brands,nutriments";

      System.out.println("🔍 Searching barcode in Open Food Facts API: " + barcode);

      // CRITICAL: Add proper User-Agent header to avoid being blocked
      HttpHeaders headers = new HttpHeaders();
      headers.set("User-Agent", "FitnessApp/1.0 (fitness-app@yourcompany.com)");

      HttpEntity<String> entity = new HttpEntity<>(headers);

      // Use exchange() instead of getForObject() to include headers
      ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
      Map<String, Object> responseBody = response.getBody();
      printResponseBody(responseBody);
      if (responseBody != null && "1".equals(String.valueOf(responseBody.get("status")))) {
        Map<String, Object> product = (Map<String, Object>) responseBody.get("product");
        return createFoodDataFromOpenFoodFacts(product, barcode);
      }

      return null;

    } catch (Exception e) {
      System.err.println("Open Food Facts barcode search error: " + e.getMessage());
      return null;
    }
  }

  /**
   * Create food data from Search-a-licious response
   */
  @SuppressWarnings("unchecked")
  private Map<String, Object> createFoodDataFromSearchALicious(Map<String, Object> hit) {
    try {
      // Extract basic food info (for Food entity)
      String name = getStringValue(hit, "product_name");
      String brand = cleanBrandName(hit.get("brands"));
      String barcode = getStringValue(hit, "code");

      if (name == null || name.trim().isEmpty()) {
        return null;
      }

      Map<String, Object> foodData = new HashMap<>();
      foodData.put("name", name);
      foodData.put("brand", brand);
      foodData.put("barcode", barcode);
      foodData.put("source", "search_a_licious");
      foodData.put("available_offline", false);

      // Extract nutrition data (for FoodNutrition entity)
      Map<String, Object> nutriments = (Map<String, Object>) hit.get("nutriments");
      if (nutriments != null) {
        Map<String, Object> nutrition = new HashMap<>();

        // Extract the exact fields your FoodNutrition entity needs
        Double calories = getDoubleValue(nutriments, "energy-kcal_100g");
        Double protein = getDoubleValue(nutriments, "proteins_100g");
        Double carbs = getDoubleValue(nutriments, "carbohydrates_100g");
        Double fat = getDoubleValue(nutriments, "fat_100g");
        Double fiber = getDoubleValue(nutriments, "fiber_100g");
        Double sugar = getDoubleValue(nutriments, "sugars_100g");
        Double sodium = getDoubleValue(nutriments, "sodium_100g");

        // Convert sodium from g to mg (as your entity expects mg)
        if (sodium != null) sodium = sodium * 1000;

        nutrition.put("calories", calories);
        nutrition.put("protein", protein);
        nutrition.put("carbs", carbs);
        nutrition.put("fat", fat);
        nutrition.put("fiber", fiber);
        nutrition.put("sugar", sugar);
        nutrition.put("sodium", sodium);

        foodData.put("nutrition", nutrition);
        foodData.put("hasNutrition", calories != null);
      } else {
        foodData.put("hasNutrition", false);
      }

      return foodData;

    } catch (Exception e) {
      System.out.println("Error creating food data from Search-a-licious: " + e.getMessage());
      return null;
    }
  }

  /**
   * Create food data from Open Food Facts API response
   */
  @SuppressWarnings("unchecked")
  private Map<String, Object> createFoodDataFromOpenFoodFacts(Map<String, Object> product, String barcode) {
    try {
      // Extract basic food info
      String name = getStringValue(product, "product_name");
      String brand = cleanBrandName(product.get("brands"));

      if (name == null || name.trim().isEmpty()) {
        return null;
      }

      Map<String, Object> foodData = new HashMap<>();
      foodData.put("name", name);
      foodData.put("brand", brand);
      foodData.put("barcode", barcode);
      foodData.put("source", "open_food_facts");
      foodData.put("available_offline", false);

      // Extract nutrition data from Open Food Facts format
      Map<String, Object> nutriments = (Map<String, Object>) product.get("nutriments");
      if (nutriments != null) {
        Map<String, Object> nutrition = new HashMap<>();

        // Open Food Facts uses these exact field names
        Double calories = getDoubleValue(nutriments, "energy");
        Double protein = getDoubleValue(nutriments, "proteins");
        Double carbs = getDoubleValue(nutriments, "carbohydrates");
        Double fat = getDoubleValue(nutriments, "fat");
        Double fiber = getDoubleValue(nutriments, "fiber");
        Double sugar = getDoubleValue(nutriments, "sugars");
        Double sodium = getDoubleValue(nutriments, "sodium");

        // Convert sodium from g to mg (your entity expects mg)
        if (sodium != null && !getStringValue(nutriments, "sodium_unit").equals("mg")) sodium = sodium * 1000;

        nutrition.put("calories", calories);
        nutrition.put("protein", protein);
        nutrition.put("carbs", carbs);
        nutrition.put("fat", fat);
        nutrition.put("fiber", fiber);
        nutrition.put("sugar", sugar);
        nutrition.put("sodium", sodium);

        foodData.put("nutrition", nutrition);
        foodData.put("hasNutrition", calories != null);
      } else {
        foodData.put("hasNutrition", false);
      }

      return foodData;

    } catch (Exception e) {
      System.out.println("Error creating food data from Open Food Facts: " + e.getMessage());
      return null;
    }
  }

  /**
   * Create and save Food and FoodNutrition entities from API data
   */
  private Food createAndSaveFoodFromAPI(Map<String, Object> foodData) {
    // Create Food entity
    String name = (String) foodData.get("name");
    String brand = (String) foodData.get("brand");
    String barcode = (String) foodData.get("barcode");

    Food food = new Food(name, brand, barcode);
    Food savedFood = foodRepository.save(food);

    // Create FoodNutrition entity if nutrition data exists
    @SuppressWarnings("unchecked")
    Map<String, Object> nutrition = (Map<String, Object>) foodData.get("nutrition");
    if (nutrition != null && (Boolean) foodData.get("hasNutrition")) {
      FoodNutrition foodNutrition = new FoodNutrition(
          savedFood.getId(),
          BigDecimal.valueOf(getDoubleOrZero(nutrition, "calories")),
          BigDecimal.valueOf(getDoubleOrZero(nutrition, "protein")),
          BigDecimal.valueOf(getDoubleOrZero(nutrition, "carbs")),
          BigDecimal.valueOf(getDoubleOrZero(nutrition, "fat"))
      );

      // Set optional nutrition fields
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

  @SuppressWarnings("unchecked")
  private String cleanBrandName(Object brandValue) {
    if (brandValue == null) {
      return null;
    }

    try {
      String brandStr;

      // Handle if it comes as a List (JSON array)
      if (brandValue instanceof List) {
        List<Object> brandList = (List<Object>) brandValue;
        if (brandList.isEmpty()) {
          return null;
        }
        // Take the first brand from the list
        brandStr = brandList.get(0).toString();
      } else {
        brandStr = brandValue.toString();
      }

      // Clean the string
      brandStr = brandStr.trim();

      // Remove square brackets
      if (brandStr.startsWith("[") && brandStr.endsWith("]")) {
        brandStr = brandStr.substring(1, brandStr.length() - 1);
      }

      // Remove quotes
      brandStr = brandStr.replace("\"", "").replace("'", "");

      // Handle comma-separated brands - take first one
      if (brandStr.contains(",")) {
        brandStr = brandStr.split(",")[0].trim();
      }

      // Remove extra whitespace and line breaks
      brandStr = brandStr.replaceAll("\\s+", " ").trim();

      // Return null if empty after cleaning
      return brandStr.isEmpty() ? null : brandStr;

    } catch (Exception e) {
      System.out.println("Error cleaning brand name: " + e.getMessage());
      return brandValue.toString().trim();
    }
  }

  /**
   * Enforce rate limiting to prevent API timeouts
   */
  private void enforceRateLimit(long rateLimitMs, AtomicLong lastRequest) {
    long now = System.currentTimeMillis();
    long lastRequestTime = lastRequest.get();
    long timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < rateLimitMs) {
      long waitTime = rateLimitMs - timeSinceLastRequest;
      try {
        System.out.println("Rate limiting: waiting " + waitTime + "ms");
        Thread.sleep(waitTime);
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new RuntimeException("Rate limiting interrupted", e);
      }
    }
    lastRequest.set(System.currentTimeMillis());
  }

  @SuppressWarnings("unchecked")
  private List<Map<String, Object>> searchAndCacheFromAPI(String query, int limit) {
    List<Map<String, Object>> results = new ArrayList<>();

    try {
      // Use v1 API for text search - this is the CORRECT way
      String encodedQuery = URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);
      String url = config.getBaseUrl() + "/cgi/search.pl" +
          "?search_terms=" + encodedQuery +
          "&search_simple=1" +
          "&action=process" +
          "&json=1" +
          "&page_size=" + Math.min(limit, 20) +
          "&fields=code,product_name,brands,nutriments,categories";
      System.out.println(url);
      System.out.println("🔍 Searching API v1 (text search): " + query);
      Map<String, Object> response = restTemplate.getForObject(url, Map.class);

      if (response != null) {
        List<Map<String, Object>> products = (List<Map<String, Object>>) response.get("products");

        if (products != null) {
          for (Map<String, Object> product : products) {
            try {
              Map<String, Object> foodData = createAPIFoodResponse(product);

              if (foodData != null) {
                // AUTO-CACHE: Save good foods with nutrition to local database
                if ((Boolean) foodData.getOrDefault("hasNutrition", false)) {
                  String barcode = (String) foodData.get("barcode");
                  if (barcode != null && !foodRepository.existsByBarcode(barcode)) {
                    Food cachedFood = createFoodFromAPIData(foodData, barcode);
                    System.out.println("📄 Auto-cached: " + foodData.get("name"));

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
              System.out.println("Failed to process product during search: " + e.getMessage());
            }
          }
        }
      }

    } catch (HttpClientErrorException.TooManyRequests e) {
      System.err.println("Rate limit exceeded during search. Increase delays between requests.");
      throw new RuntimeException("API rate limit exceeded. Please try again later.");
    } catch (HttpServerErrorException e) {
      System.err.println("Open Food Facts server error: " + e.getStatusCode());
      throw new RuntimeException("Open Food Facts service temporarily unavailable.");
    } catch (Exception e) {
      System.err.println("Open Food Facts search error: " + e.getMessage());
      // Don't throw exception here - return partial results from local DB
      System.out.println("⚠️ API search failed, returning local results only");
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

  // Add this method to your class
  private void printResponseBody(Map<String, Object> responseBody) {
    try {
      ObjectMapper mapper = new ObjectMapper();
      mapper.enable(SerializationFeature.INDENT_OUTPUT);
      String prettyJson = mapper.writeValueAsString(responseBody);
      System.out.println("Response body (formatted):");
      System.out.println(prettyJson);
    } catch (Exception e) {
      System.out.println("Response body (raw): " + responseBody);
    }
  }
}