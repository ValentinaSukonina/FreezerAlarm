package com.example.backend.service;

import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.entity.FreezerUser;
import com.example.backend.entity.User;
import com.example.backend.exception.Exceptions;
import com.example.backend.repository.FreezerRepository;
import com.example.backend.repository.FreezerUserRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("User not found with ID: " + userId));

        // Validate if the freezer exists
        Freezer freezer = freezerRepository.findById(freezerId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Freezer not found with ID: " + freezerId));

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

    public void unbindUserFromFreezer(Long userId, Long freezerId) {
        // Find the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("User not found with ID: " + userId));

        // Find the freezer
        Freezer freezer = freezerRepository.findById(freezerId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Freezer not found with ID: " + freezerId));

        // Delete association
        int deletedCount = freezerUserRepository.deleteByFreezerAndUser(freezer, user);

        if (deletedCount == 0) {
            throw new Exceptions.ResourceNotFoundException("No association found between user " + userId + " and freezer " + freezerId);
        }
    }

    public FreezerUser updateFreezerUser(Long userId, Long oldFreezerId, Long newFreezerId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("User not found with ID: " + userId));

        Freezer oldFreezer = freezerRepository.findById(oldFreezerId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Old freezer not found with ID: " + oldFreezerId));

        Freezer newFreezer = freezerRepository.findById(newFreezerId)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("New freezer not found with ID: " + newFreezerId));

        FreezerUser freezerUser = freezerUserRepository.findByFreezerAndUser(oldFreezer, user)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("No association found between user " + userId + " and freezer " + oldFreezerId));

        freezerUser.setFreezer(newFreezer);
        return freezerUserRepository.save(freezerUser);
    }

    public List<UserDTO> getUsersByFreezerNumber(String freezerNumber) {
        Freezer freezer = freezerRepository.findByNumber(freezerNumber)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("Freezer with number " + freezerNumber + " does not exist."));
        List<User> users = freezerUserRepository.findUsersByFreezerNumber(freezerNumber);

        if (users.isEmpty()) {
            throw new Exceptions.ResourceNotFoundException("No users found for freezer number: " + freezerNumber);
        }

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

    public List<FreezerDTO> getFreezersByUserId(Long userId) {
        List<Freezer> freezerUsers = freezerUserRepository.findFreezersByUserId(userId);

        return freezerUsers.stream()
                .map(fu -> {
                    Freezer freezer = fu.getFreezer();
                    return new FreezerDTO(
                            freezer.getId(),
                            freezer.getNumber(),
                            freezer.getRoom(),
                            freezer.getAddress(),
                            freezer.getType(),
                            fu.getFreezer().getNumber()
                    );
                })
                .collect(Collectors.toList());
    }
}






