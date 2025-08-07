package com.fitnessplatform.user_service;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank(message = "Username is required")
  @Column(nullable = false)
  private String username;

  @Email(message = "Email must be valid")
  @NotBlank(message = "Email is required")
  @Column(nullable = false, unique = true)
  private String email;

  @NotBlank(message = "Password is required")
  @Column(nullable = false)
  private String password;

  @NotBlank(message = "DOB is required")
  @Column(nullable = false)
  private LocalDate dateOfBirth;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  // Constructors
  public User() {}

  public User(String username, String email, String password, LocalDate dateOfBirth) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.createdAt = LocalDateTime.now();
    this.dateOfBirth = dateOfBirth;
  }

  // Getters and Setters
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getUsername() { return username; }
  public void setName(String username) { this.username = username; }

  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }

  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }

  public LocalDate getDateOfBirth() {return dateOfBirth;}
  public void setDateOfBirth(LocalDate dateOfBirth) {this.dateOfBirth = dateOfBirth;}

  public LocalDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}