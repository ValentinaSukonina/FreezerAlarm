package com.example.backend.service;


import com.example.backend.entity.Freezer;
import com.example.backend.entity.User;
import com.example.backend.exception.Exceptions;
import com.example.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    //we can add find user by name, by role,by rank if needed

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

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

   public User updateUser(Long id, User user) {
        return userRepository.findById(id).map(dbUser ->{
            dbUser.setName(user.getName());
            dbUser.setEmail(user.getEmail());
            dbUser.setPhoneNumber(user.getPhoneNumber());
            dbUser.setRole(user.getRole());
            return userRepository.save(dbUser);

        }).orElseThrow(()-> new Exceptions.ResourceNotFoundException("User with id " + id + " not found"));
    }


    @Cacheable("allUsers")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

}

