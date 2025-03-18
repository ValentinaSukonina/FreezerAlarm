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
                        .successHandler((request, response, authentication) -> {
                            System.out.println("Logged in as: " + authentication.getName());
                            response.sendRedirect("http://localhost:5173/freezers"); // Redirect to frontend after login
                        })
                )
                .logout(logout -> logout
                        .logoutSuccessUrl("http://localhost:5173") // Redirect to homepage after logout
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .clearAuthentication(true)
                )
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable());

        return http.build();
    }
}





