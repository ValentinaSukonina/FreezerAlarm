package com.example.backend.config;

import com.example.backend.repository.UserRepository;
import com.example.backend.entity.User;
import jakarta.servlet.http.HttpSession;
import org.apache.tomcat.util.modeler.OperationInfo;
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
                        .successHandler((request, response, authentication) -> {
                            OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

                            String email = oauthUser.getAttribute("email");
                            String name = oauthUser.getAttribute("name");
                            HttpSession session = request.getSession();
                            String preAuthorizedEmail = (String) session.getAttribute("preAuthorizedEmail");

                            System.out.println("Google login: " + name + " <" + email + ">");
                            System.out.println("Pre-authorized email in session: " + preAuthorizedEmail);

                            if (email == null) {
                                System.out.println("Email not found in Google token.");
                                response.sendRedirect("http://localhost:5173/unauthorized");
                                return;
                            }

                            // Enforce pre-check: Google email must match pre-authorized email
                            if (preAuthorizedEmail == null || !preAuthorizedEmail.equalsIgnoreCase(email)) {
                                System.out.println(" Email mismatch. Google login = " + email + ", pre-check = " + preAuthorizedEmail);
                                session.invalidate();
                                response.sendRedirect("http://localhost:5173/unauthorized");
                                return;
                            }

                            // Proceed only if email is in DB
                            userRepository.findByEmail(email).ifPresentOrElse(user -> {
                                session.setAttribute("isLoggedIn", "true");
                                session.setAttribute("role", user.getRole());
                                session.setAttribute("username", user.getName());
                                session.setAttribute("email", user.getEmail());

                                System.out.println("✅ Authenticated user: " + user.getName() + ", role: " + user.getRole());
                                try {
                                    response.sendRedirect("http://localhost:5173/freezers");
                                } catch (Exception e) {
                                    e.printStackTrace();
                                }
                            }, () -> {
                                System.out.println("❌ Email found in Google, but not in DB: " + email);
                                try {
                                    response.sendRedirect("http://localhost:5173/unauthorized");
                                } catch (Exception e) {
                                    e.printStackTrace();
                                }
                            });
                        })
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
                                System.out.println("Session invalidated on logout");
                            }
                            if (authentication != null) {
                                System.out.println("User logged out: " + authentication.getName());
                            }
                        })
                );

        return http.build();
    }
}