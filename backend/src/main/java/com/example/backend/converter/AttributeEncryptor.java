package com.example.backend.converter;

import com.example.backend.util.EncryptionUtil;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Component
@Converter(autoApply = false) // or true, depending on your need
public class AttributeEncryptor implements AttributeConverter<String, String> {

    private final EncryptionUtil encryptionUtil;

    @Autowired
    public AttributeEncryptor(EncryptionUtil encryptionUtil) {
        this.encryptionUtil = encryptionUtil;
    }

    @PostConstruct
    public void postConstruct() {
        System.out.println("✅ AttributeEncryptor initialized with key");
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        try {
            return attribute == null ? null : encryptionUtil.encrypt(attribute);
        } catch (Exception e) {
            System.err.println("❌ Encryption failed for value: " + e.getMessage());
            throw new IllegalStateException("Encryption failed", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        try {
            return dbData == null ? null : encryptionUtil.decrypt(dbData);
        } catch (Exception e) {
            System.err.println("❌ Decryption failed: " + e.getMessage());
            throw new IllegalStateException("Decryption failed", e);
        }
    }
}