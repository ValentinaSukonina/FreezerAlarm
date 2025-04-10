package com.example.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpSession;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
public class SessionDebugController {
    @GetMapping("/api/session-debug")
    public ResponseEntity<?> getSessionDebug(HttpSession session, Principal principal) {
        Map<String, Object> data = new HashMap<>();
        data.put("sessionId", session.getId());
        data.put("isLoggedIn", session.getAttribute("isLoggedIn"));
        data.put("user", principal != null ? principal.getName() : null);
        return ResponseEntity.ok(data);
    }
}
