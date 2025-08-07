package com.fitnessplatform.user_service;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .anyRequest().permitAll()  // Allow ALL requests without authentication
        )
        .csrf(csrf -> csrf.disable())  // Disable CSRF
        .httpBasic(httpBasic -> httpBasic.disable())  // Disable HTTP Basic auth
        .formLogin(formLogin -> formLogin.disable());  // Disable form login

    return http.build();
  }

  // Bean for password encoding (we still need this for hashing passwords)
  @Bean
  public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
    return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
  }
}
