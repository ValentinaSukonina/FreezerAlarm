package com.example.backend.controller;

import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.FreezerService;
import com.example.backend.service.FreezerUserService;
import com.example.backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("api/users")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final FreezerUserService freezerUserService;
    private final FreezerService freezerService;

    public UserController(UserService userService, UserRepository userRepository, UserMapper userMapper, FreezerUserService freezerUserService, FreezerService freezerService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.freezerUserService = freezerUserService;
        this.freezerService = freezerService;
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User savedUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toUserDTO(savedUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Failed to create user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred.");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        try {
            userService.deleteUserById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Failed to delete user with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete user");
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserDTO> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error fetching users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred.");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UserDTO userDTO = userService.getUserById(id);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            logger.error("Error fetching user with ID {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred.");
        }
    }

    @PostMapping("/check-user")
    public ResponseEntity<?> checkUser(@RequestBody UserRequest request) {
        Optional<User> user = userService.findByName(request.name());
        if (user.isPresent()) {
            return ResponseEntity.ok().body(Map.of("exists", true));
        } else {
            return ResponseEntity.ok().body(Map.of("exists", false));
        }
    }

    public record UserRequest(String name) {
    }

    @GetMapping("/user")
    public ResponseEntity<?> getAuthenticatedUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not authenticated.");
        }
        return ResponseEntity.ok(principal);
    }

    @GetMapping("/by-name/{username}")
    public ResponseEntity<UserDTO> getUserByName(@PathVariable String username) {
        return userService.findByName(username)
                .map(userMapper::toUserDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody User user) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        try {
            User updatedUser = userService.updateUser(id, user);
            return ResponseEntity.ok(userMapper.toUserDTO(updatedUser));
        } catch (Exception e) {
            logger.error("Failed to update user with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{userId}/freezers")
    public ResponseEntity<List<FreezerDTO>> getFreezersByUserId(@PathVariable Long userId) {
        try {
            List<FreezerDTO> freezers = freezerService.getFreezersByUserId(userId);
            if (freezers.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(freezers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}







