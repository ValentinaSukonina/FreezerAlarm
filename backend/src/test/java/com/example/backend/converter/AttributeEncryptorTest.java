package com.example.backend.converter;

import com.example.backend.util.EncryptionUtil;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;

public class AttributeEncryptorTest {

    private AttributeEncryptor encryptor;

    @BeforeAll
    static void disableLogging() {
        Logger root = (Logger) LoggerFactory.getLogger(Logger.ROOT_LOGGER_NAME);
        root.setLevel(Level.OFF);
    }

    @BeforeEach
    void setUp() {
        EncryptionUtil encryptionUtil = new EncryptionUtil("MySecretKey12345");
        encryptor = new AttributeEncryptor(encryptionUtil);
    }

    @Test
    void testEncryptionDecryption() {
        String original = "test@example.com";
        String encrypted = encryptor.convertToDatabaseColumn(original);
        assertNotNull(encrypted);
        assertNotEquals(original, encrypted);

        String decrypted = encryptor.convertToEntityAttribute(encrypted);
        assertEquals(original, decrypted);
    }

    @Test
    void testNullInput() {
        assertNull(encryptor.convertToDatabaseColumn(null));
        assertNull(encryptor.convertToEntityAttribute(null));
    }

    @Test
    void decryptingInvalidValue_shouldThrowException() {
        String invalidEncryptedValue = "this-is-not-base64";

        assertThatThrownBy(() -> {
            encryptor.convertToEntityAttribute(invalidEncryptedValue);
        })
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Could not decrypt data");
    }

}
