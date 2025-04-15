package com.example.backend.config;

import com.example.backend.config.CustomOAuth2SuccessHandler;
import com.example.backend.controller.AuthController;
import com.example.backend.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserRepository userRepository;
    private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;

    public SecurityConfig(UserRepository userRepository, CustomOAuth2SuccessHandler customOAuth2SuccessHandler) {
        this.userRepository = userRepository;
        this.customOAuth2SuccessHandler = customOAuth2SuccessHandler;
    }

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/",
                                "/create-account",
                                "/api/users/check-user",
                                "/api/auth/**",
                                "/api/email/send"
                        ).permitAll()
                        .requestMatchers("/oauth2/**", "/login/**", "/error").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth -> oauth
                        .successHandler(customOAuth2SuccessHandler)
                )
                .logout(logout -> logout
                        .logoutSuccessUrl("http://localhost:5173")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .clearAuthentication(true)
                        .addLogoutHandler((request, response, authentication) -> {
                            HttpSession session = request.getSession(false);
                            if (session != null) {
                                session.invalidate(); // force clear everything
                                logger.info("Session invalidated on logout");
                            }
                            if (authentication != null) {
                                logger.info("User logged out: " + authentication.getName());
                            }
                        })
                );

        return http.build();
    }
}