package com.example.backend.service;


import com.example.backend.entity.Freezer;
import com.example.backend.entity.User;
import com.example.backend.exception.Exceptions;
import com.example.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService (UserRepository userRepository) {
        this.userRepository = userRepository;
    };

    public User createUser(User user) {
        Optional<User> existingUser = userRepository.findById(user.getId());
        if (existingUser.isPresent()) {
            throw new Exceptions.UserAlreadyExistsException("User  with ID  "
                    + user.getId() + " already exists.");
        }

        return userRepository.save(user);
    }

}

