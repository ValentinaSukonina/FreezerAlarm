package com.example.backend.config;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.DependsOn;

@TestConfiguration
public class TestConfig {

    @Bean
    @DependsOn("entityManagerFactory")
    public TestDataInitializer testDataInitializer(UserRepository userRepository) {
        return new TestDataInitializer(userRepository);
    }

    public static class TestDataInitializer {

        public TestDataInitializer(UserRepository userRepository) {
            // Create test users only if they don't exist
            if (userRepository.findByEmail("user@example.com").isEmpty()) {
                userRepository.save(User.builder()
                        .name("Regular User")
                        .phoneNumber("000111222")
                        .email("user@example.com")
                        .user_rank(1)
                        .role("USER")
                        .build());
            }

            if (userRepository.findByEmail("admin@example.com").isEmpty()) {
                userRepository.save(User.builder()
                        .name("Admin User")
                        .phoneNumber("999888777")
                        .email("admin@example.com")
                        .user_rank(10)
                        .role("ADMIN")
                        .build());
            }
        }
    }
}