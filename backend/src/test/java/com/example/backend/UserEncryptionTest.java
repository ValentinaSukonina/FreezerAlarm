package com.example.backend;

import com.example.backend.converter.AttributeEncryptor;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.util.EncryptionUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@TestPropertySource(properties = {
        "data.encryption.key=TESTKEY1234567890"
})
public class UserEncryptionTest {

    @Autowired
    private UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @BeforeEach
    void setUp() {
        String testKey = "TESTKEY123456789";
        AttributeEncryptor.setEncryptionUtil(new EncryptionUtil(testKey));
    }

    @Test
    public void testEmailAndPhoneAreEncryptedAndDecrypted() {
        // Arrange
        String plainEmail = "test@example.com";
        String plainPhone = "+123456789";
        User user = new User();
        user.setName("Test User");
        user.setEmail(plainEmail);
        user.setPhoneNumber(plainPhone);
        user.setRole("USER");

        User saved = userRepository.save(user);
        Long savedId = saved.getId();

        User loaded = userRepository.findById(savedId).orElseThrow();
        assertThat(loaded.getEmail()).isEqualTo(plainEmail);
        assertThat(loaded.getPhoneNumber()).isEqualTo(plainPhone);

        // DB check (raw values should not match plain text)
        String rawEmail = (String) entityManager
                .createNativeQuery("SELECT email FROM userdb WHERE id = ?1")
                .setParameter(1, savedId)
                .getSingleResult();

        String rawPhone = (String) entityManager
                .createNativeQuery("SELECT phone_number FROM userdb WHERE id = ?1")
                .setParameter(1, savedId)
                .getSingleResult();

        assertThat(rawEmail).isNotEqualTo(plainEmail).doesNotContain("@");
        assertThat(rawPhone).isNotEqualTo(plainPhone).doesNotContain("123");
    }
}