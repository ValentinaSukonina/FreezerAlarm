package com.example.backend;

import com.example.backend.converter.AttributeEncryptor;
import com.example.backend.util.EncryptionUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserEncryptionTest {

    private AttributeEncryptor encryptor;

    @BeforeEach
    void setUp() {
        EncryptionUtil encryptionUtil = new EncryptionUtil("MySecretKey12345");
        encryptor = new AttributeEncryptor(encryptionUtil);
    }

    @Test
    void testEmailEncryptionOnUserEntity() {
        String email = "john.doe@domain.com";
        String encryptedEmail = encryptor.convertToDatabaseColumn(email);
        assertNotEquals(email, encryptedEmail);

        String decryptedEmail = encryptor.convertToEntityAttribute(encryptedEmail);
        assertEquals(email, decryptedEmail);
    }

    @Test
    void testPhoneEncryptionOnUserEntity() {
        String phone = "0700-123456";
        String encryptedPhone = encryptor.convertToDatabaseColumn(phone);
        assertNotEquals(phone, encryptedPhone);

        String decryptedPhone = encryptor.convertToEntityAttribute(encryptedPhone);
        assertEquals(phone, decryptedPhone);
    }
}