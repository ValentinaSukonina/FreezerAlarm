package com.example.backend.repository;

import com.example.backend.entity.User;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@Transactional
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setName("Alice");
        user.setEmail("alice@example.com");
        user.setPhoneNumber("0712345678");
        user.setUser_rank(1);
        user.setRole("admin");
        entityManager.persist(user);
        entityManager.flush();
    }

    @Test
    @DisplayName("should find user by name")
    void shouldFindByName() {
        Optional<User> result = userRepository.findByName("Alice");
        assertTrue(result.isPresent());
        assertEquals("alice@example.com", result.get().getEmail());
    }

    @Test
    @DisplayName("should find user by email")
    void shouldFindByEmail() {
        Optional<User> result = userRepository.findByEmail("alice@example.com");
        assertTrue(result.isPresent());
        assertEquals("Alice", result.get().getName());
    }

    @Test
    @DisplayName("should find user by name and email")
    void shouldFindByNameAndEmail() {
        Optional<User> result = userRepository.findByNameAndEmail("Alice", "alice@example.com");
        assertTrue(result.isPresent());
        assertEquals("0712345678", result.get().getPhoneNumber());
    }

    @Test
    @DisplayName("should return empty for non-existent name")
    void shouldReturnEmptyForUnknownName() {
        Optional<User> result = userRepository.findByName("Bob");
        assertFalse(result.isPresent());
    }
}
