package com.example.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private static final String EMAIL_KEY = "email";
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @GetMapping("/check-user")
    public ResponseEntity<Boolean> checkUserAuthorization(
            @RequestParam String name,
            @RequestParam String email
    ) {
        boolean exists = userRepository.findByNameAndEmail(name, email).isPresent();
        return ResponseEntity.ok(exists);
    }

    @PostMapping("/set-preauth-email")
    public ResponseEntity<Void> setPreAuthorizedEmail(HttpSession session, @RequestBody Map<String, String> payload) {
        String email = payload.get(EMAIL_KEY);
        session.setAttribute("preAuthorizedEmail", email);
        logger.info("Stored pre-authorized email: {}", email);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/role")
    public ResponseEntity<String> getUserRole(HttpServletRequest request) {
        Object role = request.getSession().getAttribute("role");
        return ResponseEntity.ok(role != null ? role.toString() : "");
    }

    @GetMapping("/session-user")
    public ResponseEntity<Map<String, Object>> getSessionUser(HttpSession session) {
        Map<String, Object> sessionData = new HashMap<>();
        sessionData.put("username", session.getAttribute("username"));
        sessionData.put("role", session.getAttribute("role"));
        sessionData.put(EMAIL_KEY, session.getAttribute(EMAIL_KEY));
        sessionData.put("isLoggedIn", session.getAttribute("isLoggedIn"));
        return ResponseEntity.ok(sessionData);
    }

    @GetMapping("/oauth2callback")
    public ResponseEntity<String> handleOAuthCallback(@RequestParam(required = false) String code,
                                                      @RequestParam(required = false) String error) {
        if (error != null) {
            return ResponseEntity.badRequest().body("Error from Google: " + error);
        }
        if (code == null) {
            return ResponseEntity.badRequest().body("No code received.");
        }
        return ResponseEntity.ok("Your auth code is: " + code);
    }
}