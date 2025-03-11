package com.example.backend.config;

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
                        .requestMatchers(
                                "/",
                                "/create-account",
                                "/api/users/check-user", // your specific endpoint
                                "/oauth2/**",
                                "/login/**",
                                "/error", // make sure to allow error handling too
                                "/**/*.css", "/**/*.js" // static files if needed
                        ).permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll() // allow all OPTIONS
                        .anyRequest().authenticated() // everything else needs auth
                )
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl("/", true) // optional redirect after OAuth login
                )
                .cors(cors -> {}) // enable CORS (will use your CorsConfig)
                .csrf(csrf -> csrf.disable()); // disable CSRF if using REST API

        return http.build();
    }
}

