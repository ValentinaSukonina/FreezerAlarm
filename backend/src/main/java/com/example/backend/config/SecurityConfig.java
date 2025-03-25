package com.example.backend.config;

import com.example.backend.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

                                    String name = oauthUser.getAttribute("name");
                                    System.out.println("Logged in as (name): " + name);

                                    userRepository.findByName(name).ifPresent(user -> {
                                        HttpSession session = request.getSession();
                                        session.setAttribute("isLoggedIn", "true");
                                        session.setAttribute("role", user.getRole());
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
                            System.out.println("User logged out: " + authentication.getName());
                        })
                )
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable());

        return http.build();
    }
}









