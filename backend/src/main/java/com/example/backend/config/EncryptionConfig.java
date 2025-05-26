package com.example.backend.config;

import com.example.backend.converter.AttributeEncryptor;
import com.example.backend.util.EncryptionUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EncryptionConfig {

    @Value("${encryption.key}")
    private String encryptionKey;

    @Bean
    public EncryptionUtil encryptionUtil() {
        return new EncryptionUtil(encryptionKey);
    }

    @Bean
    public AttributeEncryptor attributeEncryptor(EncryptionUtil encryptionUtil) {
        return new AttributeEncryptor(encryptionUtil);
    }
}