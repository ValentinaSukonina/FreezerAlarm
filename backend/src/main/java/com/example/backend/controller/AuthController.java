package com.example.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.backend.repository.UserRepository;
import com.example.backend.entity.User;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

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
        String email = payload.get("email");
        session.setAttribute("preAuthorizedEmail", email);
        System.out.println("Stored pre-authorized email: " + email);
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
        sessionData.put("email", session.getAttribute("email"));
        sessionData.put("isLoggedIn", session.getAttribute("isLoggedIn"));
        return ResponseEntity.ok(sessionData);
    }

}
