package com.fitnessplatform.nutrition_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.Collections;

@Configuration
public class OpenFoodFactsConfig {

  @Value("${openfoodfacts.base-url:https://world.openfoodfacts.net}")
  private String baseUrl;

  @Value("${openfoodfacts.username:off}")
  private String username;

  @Value("${openfoodfacts.password:off}")
  private String password;

  @Value("${openfoodfacts.user-agent:FitnessNutritionApp/1.0 (matthewaustin2807@gmail.com)}")
  private String userAgent;

  @Bean
  public RestTemplate restTemplate() {
    RestTemplate restTemplate = new RestTemplate();

    // Add interceptor for authentication and user-agent
    ClientHttpRequestInterceptor interceptor = (request, body, execution) -> {
      HttpHeaders headers = request.getHeaders();

      // Add User-Agent header
      headers.set(HttpHeaders.USER_AGENT, userAgent);

      // Add Basic Authentication for staging environment
      if (baseUrl.contains("openfoodfacts.net")) {
        String credentials = username + ":" + password;
        String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());
        headers.set(HttpHeaders.AUTHORIZATION, "Basic " + encodedCredentials);
      }

      return execution.execute(request, body);
    };

    restTemplate.setInterceptors(Collections.singletonList(interceptor));
    return restTemplate;
  }

  public String getBaseUrl() {
    return baseUrl;
  }
}