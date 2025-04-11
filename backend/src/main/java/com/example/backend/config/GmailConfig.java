package com.example.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "spring.gmail")
public class GmailConfig {
    private String clientId;
    private String clientSecret;
    private String refreshToken;
    private String emailFrom;
}