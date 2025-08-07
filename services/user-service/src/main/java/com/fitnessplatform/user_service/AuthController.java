package com.fitnessplatform.user_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

  @Autowired
  private AuthService authService;

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
    try {
      String username = request.get("name");
      String email = request.get("email");
      String password = request.get("password");
      String dateOfBirth = request.get("dob");

      User user = authService.registerUser(username, email, password, LocalDate.parse(dateOfBirth));

      return ResponseEntity.ok(Map.of(
          "message", "User registered successfully",
          "user", Map.of(
              "id", user.getId(),
              "name", user.getUsername(),
              "email", user.getEmail()
          )
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", e.getMessage()
      ));
    }
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
    try {
      String email = request.get("email");
      String password = request.get("password");

      User user = authService.loginUser(email, password);

      return ResponseEntity.ok(Map.of(
          "message", "Login successful",
          "user", Map.of(
              "id", user.getId(),
              "name", user.getUsername(),
              "email", user.getEmail()
          )
      ));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(Map.of(
          "error", e.getMessage()
      ));
    }
  }
}