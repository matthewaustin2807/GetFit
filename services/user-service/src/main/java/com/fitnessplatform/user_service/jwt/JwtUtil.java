package com.fitnessplatform.user_service.jwt;

import com.fitnessplatform.user_service.user.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

  @Value("${jwt.secret:mySecretKey12345678901234567890123456789012345678901234567890}")
  private String secret;

  @Value("${jwt.expiration:86400000}") // 24 hours in milliseconds
  private Long jwtExpiration;

  @Value("${jwt.refresh-expiration:604800000}") // 7 days in milliseconds
  private Long refreshExpiration;

  // Generate token for user
  public String generateToken(User user) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", user.getId());
    claims.put("email", user.getEmail());
    claims.put("name", user.getUsername());
    return createToken(claims, user.getEmail());
  }

  // Generate refresh token
  public String generateRefreshToken(User user) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", user.getId());
    claims.put("email", user.getEmail());
    claims.put("type", "refresh");
    return createRefreshToken(claims, user.getEmail());
  }

  // Create JWT token
  private String createToken(Map<String, Object> claims, String subject) {
    return Jwts.builder()
        .claims(claims)
        .subject(subject)
        .issuedAt(new Date(System.currentTimeMillis()))
        .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
        .signWith(getSignKey(), Jwts.SIG.HS256)
        .compact();
  }

  // Create refresh token
  private String createRefreshToken(Map<String, Object> claims, String subject) {
    return Jwts.builder()
        .claims(claims)
        .subject(subject)
        .issuedAt(new Date(System.currentTimeMillis()))
        .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
        .signWith(getSignKey(), Jwts.SIG.HS256)
        .compact();
  }

  // Get signing key
  private SecretKey getSignKey() {
    return Keys.hmacShaKeyFor(secret.getBytes());
  }

  // Extract username from token
  public String extractUsername(String token) {
    return extractClaim(token, Claims::getSubject);
  }

  // Extract user ID from token
  public Long extractUserId(String token) {
    return extractClaim(token, claims -> claims.get("userId", Long.class));
  }

  // Extract expiration date
  public Date extractExpiration(String token) {
    return extractClaim(token, Claims::getExpiration);
  }

  // Extract any claim from token
  public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
    final Claims claims = extractAllClaims(token);
    return claimsResolver.apply(claims);
  }

  // Extract all claims
  private Claims extractAllClaims(String token) {
    return Jwts.parser()
        .verifyWith(getSignKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  // Check if token is expired
  private Boolean isTokenExpired(String token) {
    return extractExpiration(token).before(new Date());
  }

  // Validate token against user details
  public Boolean validateToken(String token, User user) {
    final String username = extractUsername(token);
    return (username.equals(user.getEmail()) && !isTokenExpired(token));
  }

  // Validate token (without user object)
  public Boolean validateToken(String token) {
    try {
      return !isTokenExpired(token);
    } catch (Exception e) {
      return false;
    }
  }

  // Extract token type (access or refresh)
  public String extractTokenType(String token) {
    try {
      return extractClaim(token, claims -> claims.get("type", String.class));
    } catch (Exception e) {
      return "access"; // Default to access token
    }
  }

  // Check if token is refresh token
  public Boolean isRefreshToken(String token) {
    return "refresh".equals(extractTokenType(token));
  }
}