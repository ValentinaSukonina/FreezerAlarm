package com.example.backend.converter;

import com.example.backend.util.EncryptionUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;

public class AttributeEncryptorTest {

    private AttributeEncryptor encryptor;

    @BeforeEach
    void setUp() {
        // Use test-safe AES key (16 characters)
        String testKey = "TESTKEY123456789";
        AttributeEncryptor.setEncryptionUtil(new EncryptionUtil(testKey));
        encryptor = new AttributeEncryptor();
    }

    @Test
    void encryptAndDecrypt_shouldReturnOriginalValue() {
        String original = "secret@example.com";
        String encrypted = encryptor.convertToDatabaseColumn(original);
        String decrypted = encryptor.convertToEntityAttribute(encrypted);

        assertThat(encrypted).isNotEqualTo(original);
        assertThat(decrypted).isEqualTo(original);
    }

    @Test
    void nullValues_shouldStayNull() {
        assertThat(encryptor.convertToDatabaseColumn(null)).isNull();
        assertThat(encryptor.convertToEntityAttribute(null)).isNull();
    }

    @Test
    void decryptingInvalidValue_shouldThrowException() {
        String invalidEncryptedValue = "this-is-not-base64";

        assertThatThrownBy(() -> {
            encryptor.convertToEntityAttribute(invalidEncryptedValue);
        })
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Decryption failed");
    }

    @Test
    void encryptWithMissingUtil_shouldThrowException() {
        // Simulate missing EncryptionUtil
        AttributeEncryptor.setEncryptionUtil(null);

        assertThatThrownBy(() -> {
            new AttributeEncryptor().convertToDatabaseColumn("test@example.com");
        })
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Encryption failed");
    }
}
