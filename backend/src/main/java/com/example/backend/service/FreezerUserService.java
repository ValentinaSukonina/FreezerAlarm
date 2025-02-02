package com.example.backend.service;

import com.example.backend.entity.Freezer;
import com.example.backend.entity.FreezerUser;
import com.example.backend.entity.User;
import com.example.backend.exception.Exceptions;
import com.example.backend.repository.FreezerRepository;
import com.example.backend.repository.FreezerUserRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FreezerUserService {
    private final FreezerUserRepository freezerUserRepository;
    private final UserRepository userRepository;
    private final FreezerRepository freezerRepository;


    @Autowired
    public FreezerUserService(FreezerUserRepository freezerUserRepository, FreezerRepository freezerRepository, UserRepository userRepository) {
        this.freezerUserRepository = freezerUserRepository;
        this.freezerRepository = freezerRepository;
        this.userRepository = userRepository;
    }

    public FreezerUser bindUserToFreezer(Long userId, Long freezerId) {
        // Validate if the user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exceptions.NotFoundException("User not found with ID: " + userId));

        // Validate if the freezer exists
        Freezer freezer = freezerRepository.findById(freezerId)
                .orElseThrow(() -> new Exceptions.NotFoundException("Freezer not found with ID: " + freezerId));

        // Prevent duplicate binding
        boolean alreadyExists = freezerUserRepository.existsByUserIdAndFreezerId(userId, freezerId);

        if (alreadyExists) {
            throw new Exceptions.FreezerUserAlreadyExistsException("User is already bound to this freezer!");
        }

        FreezerUser freezerUser = new FreezerUser();
        freezerUser.setUser(user);
        freezerUser.setFreezer(freezer);
        return freezerUserRepository.save(freezerUser);
    }
}
