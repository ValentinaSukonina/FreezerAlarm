package com.example.backend.service;

import com.example.backend.controller.UserController;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import com.example.backend.exception.Exceptions;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.FreezerUserRepository;
import com.example.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    private final FreezerUserRepository freezerUserRepository;

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    public UserService(FreezerUserRepository freezerUserRepository, UserRepository userRepository, UserMapper userMapper) {
        this.freezerUserRepository = freezerUserRepository;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    public User createUser(User user) {
        final String userName = user.getName();
        final String userEmail = user.getEmail();

        boolean nameExists = userRepository.findByName(userName).isPresent();

        if (nameExists) {
            throw new Exceptions.UserAlreadyExistsException("Name already exists in the system.");
        }

        boolean emailExists = userRepository.findByEmail(userEmail).isPresent();

        if (emailExists) {
            throw new Exceptions.UserAlreadyExistsException("Email already exists in the system.");
        }

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Transactional
    public void deleteUserById(Long userId) {
        // First, delete all freezer-user bindings for this user
        freezerUserRepository.deleteByUserId(userId);

        // Then, delete the user
        userRepository.deleteById(userId);
    }

    @Transactional
    public User updateUser(Long id, User updatedUser) {
        User dbUser = userRepository.findById(id)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("User with id " + id + " not found"));

        final String newName = updatedUser.getName();
        final String newEmail = updatedUser.getEmail();

        // Check duplicate name (case-sensitive)
        userRepository.findByName(newName).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new Exceptions.UserAlreadyExistsException("Name already exists in the system.");
            }
        });

        // Check duplicate email (case-insensitive)
        userRepository.findByEmail(newEmail).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new Exceptions.UserAlreadyExistsException("Email already exists in the system.");
            }
        });

        // Update the record safely
        dbUser.setName(newName);
        dbUser.setEmail(newEmail);
        dbUser.setPhoneNumber(updatedUser.getPhoneNumber());
        dbUser.setUser_rank(updatedUser.getUser_rank());
        dbUser.setRole(updatedUser.getRole());

        try {
            return userRepository.save(dbUser);
        } catch (DataIntegrityViolationException ex) {
            // DB-level fallback (e.g., unique constraint still triggered)
            throw new Exceptions.UserAlreadyExistsException("Duplicate name or email detected.");
        }
    }

    @Cacheable("allUsers")
    public List<UserDTO> getAllUsers() {
        logger.info("Fetching all users...");
        List<User> users = userRepository.findAll();

        if (users.isEmpty()) {
            logger.warn("No users found in the database.");
            throw new RuntimeException("No users found.");
        }

        logger.info("Users fetched successfully: {}", users.size());
        return userMapper.toUserDTOList(users);
    }

    public UserDTO getUserById(Long id) {
        logger.info("Fetching user with ID {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        return userMapper.toUserDTO(user);
    }

    public Optional<User> findByName(String name) {
        return userRepository.findByName(name);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}