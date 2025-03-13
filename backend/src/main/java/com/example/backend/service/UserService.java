package com.example.backend.service;

import com.example.backend.controller.UserController;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import com.example.backend.exception.Exceptions;
import com.example.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {


    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    ;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public User updateUser(Long id, User user) {
        return userRepository.findById(id).map(dbUser -> {
            dbUser.setName(user.getName());
            dbUser.setEmail(user.getEmail());
            dbUser.setPhoneNumber(user.getPhoneNumber());
            dbUser.setRole(user.getRole());
            return userRepository.save(dbUser);

        }).orElseThrow(() -> new Exceptions.ResourceNotFoundException("User with id " + id + " not found"));
    }


    @Cacheable("allUsers")
    public List<UserDTO> getAllUsers() {
        logger.info("Fetching all users...");
        List<User> users = userRepository.findAll();

        if (users.isEmpty()) {
            logger.warn("No users found in the database.");
            throw new RuntimeException("No users found."); // Throws exception instead of returning null
        }

        logger.info("Users fetched successfully: {}", users.size());
        return users.stream()
                .map(user -> new UserDTO(
                        user.getId(),
                        user.getName(),
                        user.getPhoneNumber(),
                        user.getEmail(),
                        user.getUser_rank(),
                        user.getRole()
                ))
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        logger.info("Fetching user with ID {}", id);
        Optional<User> userOptional = userRepository.findById(id);

        return userOptional.map(user -> new UserDTO(
                user.getId(),
                user.getName(),
                user.getPhoneNumber(),
                user.getEmail(),
                user.getUser_rank(),
                user.getRole()
        )).orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }

    public Optional<User> findByName(String name) {
        return userRepository.findByName(name);
    }

}

