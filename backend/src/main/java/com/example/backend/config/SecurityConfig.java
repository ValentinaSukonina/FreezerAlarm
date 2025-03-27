package com.example.backend.config;

import com.example.backend.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;

import java.io.IOException;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserRepository userRepository;

    public SecurityConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/create-account", "/api/users/check-user", "/api/auth/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/**", "/error").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth -> oauth
                        .successHandler((request, response, authentication) -> {
                            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
                            String googleId = oauthUser.getAttribute("sub");
                            String email = oauthUser.getAttribute("email");

                            userRepository.findByGoogleId(googleId).ifPresentOrElse(user -> {
                                HttpSession session = request.getSession();
                                session.setAttribute("isLoggedIn", "true");
                                session.setAttribute("email", email);
                                session.setAttribute("role", user.getRole());
                                session.setMaxInactiveInterval(10 * 60); // Optional

                                try {
                                    response.sendRedirect("http://localhost:5173/freezers");
                                } catch (IOException e) {
                                    throw new RuntimeException(e);
                                }
                            }, () -> {
                                System.out.println("Unauthorized login attempt by Google ID: " + googleId);
                                try {
                                    response.sendRedirect("http://localhost:5173/unauthorized");
                                } catch (IOException e) {
                                    throw new RuntimeException(e);
                                }
                            });

                            return; //
                        })
                )
                .logout(logout -> logout
                        .logoutSuccessUrl("http://localhost:5173")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .clearAuthentication(true)
                        .addLogoutHandler((request, response, authentication) -> {
                            if (authentication != null) {
                                System.out.println("User logged out: " + authentication.getName());
                            }
                        })
                );

        return http.build();
    }
}
