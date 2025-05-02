package com.example.backend.controller;

import com.example.backend.dto.EmailRequestDTO;
import com.example.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    private final EmailService emailService; // depends on interface

    @Autowired
    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send")
    public ResponseEntity<String> send(@RequestBody EmailRequestDTO request) {
        try {
            emailService.sendEmail(request.getTo(), request.getSubject(), request.getBody());
            return ResponseEntity.ok("Email sent to " + request.getTo());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to send email: " + e.getMessage());
        }
    }
}
