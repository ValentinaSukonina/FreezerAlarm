package com.example.backend.controller;

import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.FreezerUserDTO;
import com.example.backend.dto.FreezerUserRequestDTO;
import com.example.backend.dto.FreezerUserUpdateRequestDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.FreezerUser;
import com.example.backend.mapper.FreezerUserMapper;
import com.example.backend.repository.FreezerUserRepository;
import com.example.backend.service.FreezerUserService;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/freezer-user")
public class FreezerUserController {
    private final FreezerUserService freezerUserService;
    private final FreezerUserRepository freezerUserRepository;
    private final FreezerUserMapper freezerUserMapper;

    public FreezerUserController(FreezerUserService freezerUserService,
                                 FreezerUserRepository freezerUserRepository,
                                 FreezerUserMapper freezerUserMapper) {
        this.freezerUserService = freezerUserService;
        this.freezerUserRepository = freezerUserRepository;
        this.freezerUserMapper = freezerUserMapper;
    }

    // POST - Bind user to freezer
    @PostMapping
    public ResponseEntity<FreezerUserDTO> bindUserToFreezer(@RequestBody FreezerUserRequestDTO request) {
        FreezerUser freezerUser = freezerUserService.bindUserToFreezer(request.getUserId(), request.getFreezerId());
        return ResponseEntity.status(HttpStatus.CREATED).body(freezerUserMapper.toDTO(freezerUser));
    }

    // DELETE User-Freezer Association
    @DeleteMapping
    public ResponseEntity<String> unbindUserFromFreezer(@RequestBody FreezerUserRequestDTO request) {
        freezerUserService.unbindUserFromFreezer(request.getUserId(), request.getFreezerId());
        return ResponseEntity.ok("User " + request.getUserId() + " unbound from Freezer " + request.getFreezerId());
    }

    //Update User-Freezer Association
    @PutMapping
    public ResponseEntity<FreezerUserDTO> updateFreezerUser(@RequestBody FreezerUserRequestDTO request) {
        if (request.getOldFreezerId() == null) {
            return ResponseEntity.badRequest().build();
        }

        FreezerUser updatedFreezerUser = freezerUserService.updateFreezerUser(
                request.getUserId(), request.getOldFreezerId(), request.getFreezerId()
        );
        return ResponseEntity.ok(freezerUserMapper.toDTO(updatedFreezerUser));
    }

    /* @GetMapping("/{freezerNumber}")
    public ResponseEntity<List<UserDTO>> getUsersByFreezerNumber(@PathVariable String freezerNumber) {
        List<UserDTO> users = freezerUserService.getUsersByFreezerNumber(freezerNumber);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{freezerNumber}")//modify path
    public ResponseEntity<List<FreezerDTO>> getFreezersByUserId(@PathVariable Long userID) {
        List<FreezerDTO> freezers = freezerUserService.getFreezersByUserId(userID);
        return ResponseEntity.ok(freezers);
    }*/

    // Fetch freezers by user ID
    @GetMapping("/freezers/{userId}")
    public List<FreezerDTO> getFreezersByUserId(@PathVariable Long userId) {
        return freezerUserService.getFreezersByUserId(userId);
    }

    // Fetch users by freezer number
    @GetMapping("/users/{freezerNumber}")
    public List<UserDTO> getUsersByFreezerNumber(@PathVariable String freezerNumber) {
        return freezerUserService.getUsersByFreezerNumber(freezerNumber);
    }

    @DeleteMapping("/users/{userId}/freezers/{freezerId}")
    public ResponseEntity<?> removeFreezerFromUser(@PathVariable Long userId, @PathVariable Long freezerId) {
        try {
            freezerUserService.unbindUserFromFreezer(userId, freezerId);  // unbind user from the freezer
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error removing freezer");
        }
    }

    @PutMapping("/bulk-update")
    public ResponseEntity<String> updateFreezerUserAssignments(@RequestBody FreezerUserUpdateRequestDTO request) {
        System.out.println("📩 This should print in IntelliJ");
        System.out.println("➡️ Request: " + request.getFreezerId() + " → " + request.getUserIds());

        freezerUserService.updateFreezerAssignments(request.getFreezerId(), request.getUserIds());
        return ResponseEntity.ok("Freezer-user assignments updated.");
    }


}