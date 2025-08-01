package com.fitnessplatform.user_service;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class HealthController {

  @GetMapping("/health")
  public String health() {
    return "User Service is healthy! 🚀";
  }

  @GetMapping("/api/test")
  public Map<String, Object> test() {
    return Map.of(
        "message", "Hello from Spring Boot!",
        "service", "user-service",
        "timestamp", LocalDateTime.now(),
        "status", "working"
    );
  }
}
