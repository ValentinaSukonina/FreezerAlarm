package com.example.backend.service;

import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.FreezerUserDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.entity.FreezerUser;
import com.example.backend.entity.User;
import com.example.backend.exception.Exceptions;
import com.example.backend.mapper.FreezerUserMapper;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.FreezerRepository;
import com.example.backend.repository.FreezerUserRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FreezerUserService {
    private final FreezerUserRepository freezerUserRepository;
    private final UserRepository userRepository;
    private final FreezerRepository freezerRepository;
    private final UserMapper userMapper;
    private final FreezerUserMapper freezerUserMapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public FreezerUserService(FreezerUserRepository freezerUserRepository,
                              FreezerRepository freezerRepository,
                              UserRepository userRepository,
                              UserMapper userMapper,
                              FreezerUserMapper freezerUserMapper) {
        this.freezerUserRepository = freezerUserRepository;
        this.freezerRepository = freezerRepository;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.freezerUserMapper = freezerUserMapper;
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

        return users.stream().map(userMapper::toUserDTO).collect(Collectors.toList());
    }


    public List<FreezerDTO> getFreezersByUserId(Long userID) {
        // Step 1: Fetch the User by ID
        User user = userRepository.findById(userID)
                .orElseThrow(() -> new Exceptions.ResourceNotFoundException("User not found with ID: " + userID));

        // Step 2: Fetch all the Freezers associated with the user
        List<FreezerUser> freezerUsers = freezerUserRepository.findByUserId(userID);

        // Step 3: If no freezers are associated with the user, throw an exception
        if (freezerUsers.isEmpty()) {
            throw new Exceptions.ResourceNotFoundException("No freezers found for user with ID: " + userID);
        }

        // Step 4: Map Freezer entities to FreezerDTO
        return freezerUsers.stream()
                .map(freezerUser -> new FreezerDTO(
                        freezerUser.getFreezer().getId(),
                        freezerUser.getFreezer().getNumber(),
                        freezerUser.getFreezer().getRoom(),
                        freezerUser.getFreezer().getType(),
                        freezerUser.getFreezer().getAddress(),
                        freezerUser.getFreezer().getFile()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateFreezerAssignments(Long freezerId, List<Long> newUserIds) {
        System.out.println("🔥 Deleting all existing assignments for freezer " + freezerId);
        freezerUserRepository.deleteByFreezerId(freezerId);
        entityManager.flush(); // ✅ Force immediate DB sync

        for (Long userId : newUserIds) {
            System.out.println("➕ Reassigning user " + userId + " to freezer " + freezerId);
            bindUserToFreezer(userId, freezerId);
        }
    }

}