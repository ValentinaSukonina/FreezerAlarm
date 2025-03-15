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
                            .requestMatchers("/", "/create-account", "/api/users/check-user").permitAll() // public routes
                            .requestMatchers("/oauth2/**", "/login/**", "/error").permitAll() // OAuth2 flow
                            .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll() // CORS preflight
                            .anyRequest().authenticated() // everything else needs login
                    )
                    .oauth2Login(oauth -> oauth
                            .defaultSuccessUrl("/", true) // redirect home after successful login
                    )
                    .cors(cors -> {})
                    .csrf(csrf -> csrf.disable());

            return http.build();
        }
    }




