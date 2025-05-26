package com.example.backend.util;

import com.example.backend.dto.FreezerWithUsersDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.entity.FreezerUser;
import com.example.backend.entity.User;
import com.example.backend.mapper.FreezerMapper;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.FreezerRepository;
import com.example.backend.repository.FreezerUserRepository;
import com.example.backend.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@Profile("populate-db")
public class DatabaseSeeder {

    private final UserRepository userRepository;
    private final FreezerRepository freezerRepository;
    private final FreezerUserRepository freezerUserRepository;
    private final UserMapper userMapper;
    private final FreezerMapper freezerMapper;
    private final ObjectMapper objectMapper;

    @Value("classpath:Freezers_Biomedicine_complete.json")
    private Resource dataFile;

    public DatabaseSeeder(UserRepository userRepository,
                          FreezerRepository freezerRepository,
                          FreezerUserRepository freezerUserRepository,
                          UserMapper userMapper,
                          FreezerMapper freezerMapper,
                          ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.freezerRepository = freezerRepository;
        this.freezerUserRepository = freezerUserRepository;
        this.userMapper = userMapper;
        this.freezerMapper = freezerMapper;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

        try {
            List<FreezerWithUsersDTO> freezerDTOs = objectMapper.readValue(
                    dataFile.getInputStream(), new TypeReference<>() {
                    }
            );

            for (FreezerWithUsersDTO dto : freezerDTOs) {
                Freezer freezer = freezerMapper.toEntity(dto);
                Freezer finalFreezer = freezer;

                Freezer finalFreezer1 = freezer;
                freezer = freezerRepository.findByNumber(freezer.getNumber())
                        .orElseGet(() -> {
                            logger.info("🧊 Creating new freezer: {}", finalFreezer1.getNumber());
                            return freezerRepository.save(finalFreezer);
                        });

                for (UserDTO userDTO : dto.users()) {
                    User user = userMapper.toEntity(userDTO);
                    User finalUser = user;

                    User finalUser1 = user;
                    user = userRepository.findByEmail(user.getEmail())
                            .orElseGet(() -> {
                                logger.info("👤 Creating new user: {}", finalUser1.getEmail());
                                return userRepository.save(finalUser);
                            });

                    boolean exists = freezerUserRepository.existsByFreezerIdAndUserId(freezer.getId(), user.getId());
                    if (!exists) {
                        FreezerUser link = new FreezerUser();
                        link.setFreezer(freezer);
                        link.setUser(user);
                        freezerUserRepository.save(link);
                        logger.info("🔗 Linked user {} to freezer {}", user.getEmail(), freezer.getNumber());
                    }
                }
            }

            logger.info("✅ Database seeding completed successfully.");

        } catch (Exception e) {
            logger.error("❌ Error during database seeding: {}", e.getMessage(), e);
            throw new IllegalStateException("Failed to seed database", e);
        }
    }
}
