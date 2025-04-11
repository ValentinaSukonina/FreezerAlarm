package com.example.backend.repository;


import com.example.backend.dto.FreezerDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.entity.FreezerUser;
import com.example.backend.entity.User;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.annotation.Rollback;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Transactional
@Rollback
public class FreezerUserRepositoryTest {

    @Autowired
    private FreezerUserRepository freezerUserRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FreezerRepository freezerRepository;

    @Autowired
    private EntityManager entityManager;

    private User user;
    private Freezer freezer;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setName("Alice");
        user.setEmail("alice@example.com");
        user.setPhoneNumber("0712345678");
        user.setUser_rank(1);
        user.setRole("admin");
        user = userRepository.save(user);

        freezer = new Freezer();
        freezer.setFile("file.png");
        freezer.setNumber("1111");
        freezer.setAddress("Cold St");
        freezer.setRoom("A1");
        freezer.setType("-80");
        freezer = freezerRepository.save(freezer);

        FreezerUser freezerUser = new FreezerUser();
        freezerUser.setUser(user);
        freezerUser.setFreezer(freezer);
        freezerUserRepository.save(freezerUser);
    }

    @Test
    @DisplayName("Should find users by freezer number")
    void shouldFindUsersByFreezerNumber() {
        List<User> users = freezerUserRepository.findUsersByFreezerNumber("1111");
        assertThat(users).hasSize(1);
        assertThat(users.get(0).getEmail()).isEqualTo("alice@example.com");
    }

    @Test
    @DisplayName("Should check if user-freezer association exists")
    void shouldCheckExistenceByUserAndFreezer() {
        boolean exists = freezerUserRepository.existsByUserIdAndFreezerId(user.getId(), freezer.getId());
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should find FreezerUser by Freezer and User")
    void shouldFindByFreezerAndUser() {
        Optional<FreezerUser> result = freezerUserRepository.findByFreezerAndUser(freezer, user);
        assertThat(result).isPresent();
    }

    @Test
    @DisplayName("Should delete association by Freezer and User")
    void shouldDeleteByFreezerAndUser() {
        int deleted = freezerUserRepository.deleteByFreezerAndUser(freezer, user);
        assertThat(deleted).isEqualTo(1);
    }

    @Test
    @DisplayName("Should find Freezers by User ID using projection")
    void shouldFindFreezersByUserId() {
        List<FreezerDTO> freezers = freezerUserRepository.findFreezersByUserId(user.getId());
        assertThat(freezers).hasSize(1);
        assertThat(freezers.get(0).number()).isEqualTo("1111");
    }

    @Test
    @DisplayName("Should delete by user ID")
    void shouldDeleteByUserId() {
        freezerUserRepository.deleteByUserId(user.getId());
        boolean exists = freezerUserRepository.existsByUserIdAndFreezerId(user.getId(), freezer.getId());
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("Should delete by freezer")
    void shouldDeleteByFreezer() {
        freezerUserRepository.deleteByFreezer(freezer);
        boolean exists = freezerUserRepository.existsByUserIdAndFreezerId(user.getId(), freezer.getId());
        assertThat(exists).isFalse();
    }
}

