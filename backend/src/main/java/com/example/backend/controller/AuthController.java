package com.example.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/role")
    public ResponseEntity<String> getUserRole(HttpServletRequest request) {
        Object role = request.getSession().getAttribute("role");
        return ResponseEntity.ok(role != null ? role.toString() : "");
    }
}
