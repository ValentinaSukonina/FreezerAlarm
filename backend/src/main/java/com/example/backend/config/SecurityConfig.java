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

                            // Debug: print all available attributes
                            oauthUser.getAttributes().forEach((k, v) -> System.out.println(k + ": " + v));

                            String email = oauthUser.getAttribute("email");
                            System.out.println("Logged in as (email): " + email);

                            userRepository.findByEmail(email).ifPresent(user -> {
                                HttpSession session = request.getSession();
                                session.setAttribute("isLoggedIn", "true");
                                session.setAttribute("email", email); // store email
                                session.setAttribute("role", user.getRole()); // store role
                                System.out.println("Stored role in session: " + user.getRole());
                            });

                            response.sendRedirect("http://localhost:5173/freezers");
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
