package com.nearshare.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Disable CSRF (Critical for POST APIs)
                .csrf(csrf -> csrf.disable())

                // 2. Enable CORS with the source defined below
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. Define Public URLs (Allow these without login check)
                .authorizeHttpRequests(auth -> auth
                        // Auth (Login/Register)
                        .requestMatchers("/api/auth/**").permitAll()

                        // ✅ Listings (View and Create)
                        .requestMatchers("/api/listings/**").permitAll()

                        // ✅ File Uploads (For images)
                        .requestMatchers("/api/upload/**").permitAll()

                        // ✅ Serve Images (View uploaded pictures)
                        .requestMatchers("/uploads/**").permitAll()

                        // Allow everything else for now (Development Mode)
                        // Change this to .authenticated() later when JWT is ready
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    // CORS Configuration (Essential for React to talk to Spring Boot)
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ FIX: Use Patterns to allow ANY IP address or localhost to connect
        configuration.setAllowedOriginPatterns(List.of("*"));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}