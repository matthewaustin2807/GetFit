package com.fitnessplatform.user_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class AuthService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  // Register new user
  public User registerUser(String username, String email, String password, LocalDate dateOfBirth) {
    // Check if email already exists
    if (userRepository.existsByEmail(email)) {
      throw new RuntimeException("Email already exists");
    }

    // Hash the password
    String hashedPassword = passwordEncoder.encode(password);

    // Create and save user
    User user = new User(username, email, hashedPassword, dateOfBirth);
    return userRepository.save(user);
  }

  // Login user
  public User loginUser(String email, String password) {
    // Find user by email
    Optional<User> userOptional = userRepository.findByEmail(email);
    if (userOptional.isEmpty()) {
      throw new RuntimeException("Invalid email or password");
    }

    User user = userOptional.get();

    // Check password
    if (!passwordEncoder.matches(password, user.getPassword())) {
      throw new RuntimeException("Invalid email or password");
    }

    return user;
  }
}