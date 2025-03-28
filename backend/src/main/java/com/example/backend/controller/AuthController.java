package com.example.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

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
        sessionData.put("isLoggedIn", session.getAttribute("isLoggedIn"));
        return ResponseEntity.ok(sessionData);
    }

}
