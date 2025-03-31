package com.example.backend.service;

import com.example.backend.controller.UserController;
import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.entity.User;
import com.example.backend.exception.Exceptions;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.FreezerUserRepository;
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

    public List<FreezerDTO> getFreezersByUserId(Long userId) {
        List<Freezer> freezers = freezerUserRepository.findFreezersByUserId(userId);

        // Convert List<Freezer> to List<FreezerDTO>
        return freezers.stream()
                .map(freezer -> new FreezerDTO(
                        freezer.getId(),
                        freezer.getNumber(),
                        freezer.getRoom(),
                        freezer.getAddress(),
                        freezer.getType()
                ))
                .collect(Collectors.toList());
    }


}


