package com.example.backend.config;

import com.example.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2SuccessHandler.class);

    public CustomOAuth2SuccessHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        HttpSession session = request.getSession();
        String preAuthorizedEmail = (String) session.getAttribute("preAuthorizedEmail");

        logger.info("Google login: " + name + " <" + email + ">");
        logger.info("Pre-authorized email in session: " + preAuthorizedEmail);

        if (email == null || preAuthorizedEmail == null || !preAuthorizedEmail.equalsIgnoreCase(email)) {
            logger.warn("❌ Email mismatch or missing.");
            session.invalidate();
            response.sendRedirect("http://localhost:5173/unauthorized");
            return;
        }

        userRepository.findByEmail(email).ifPresentOrElse(user -> {
            session.setAttribute("isLoggedIn", "true");
            session.setAttribute("role", user.getRole());
            session.setAttribute("username", user.getName());
            session.setAttribute("email", user.getEmail());

            logger.info("✅ Authenticated user: " + user.getName() + ", role: " + user.getRole());
            try {
                response.sendRedirect("http://localhost:5173/freezers");
            } catch (Exception e) {
                logger.error("Failed to redirect after login", e);
            }
        }, () -> {
            logger.warn("❌ OAuth2 login attempt failed: email '{}' not found in database.", email);
            try {
                response.sendRedirect("http://localhost:5173/unauthorized");
            } catch (Exception e) {
                logger.error("🔁 Redirect to unauthorized page failed for '{}'", email, e);
            }
        });
    }

}