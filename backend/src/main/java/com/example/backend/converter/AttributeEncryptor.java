package com.example.backend.converter;

import com.example.backend.util.EncryptionUtil;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Converter(autoApply = true)
public class AttributeEncryptor implements AttributeConverter<String, String> {

    private static final Logger logger = LoggerFactory.getLogger(AttributeEncryptor.class);
    private final EncryptionUtil encryptionUtil;

    public AttributeEncryptor(EncryptionUtil encryptionUtil) {
        this.encryptionUtil = encryptionUtil;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) return null;
        try {
            return encryptionUtil.encrypt(attribute);
        } catch (Exception e) {
            logger.debug("Encryption failed", e);
            throw new IllegalStateException("Could not encrypt data", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        try {
            return encryptionUtil.decrypt(dbData);
        } catch (Exception e) {
            logger.error("Decryption failed", e);
            throw new IllegalStateException("Could not decrypt data", e);
        }
    }
}