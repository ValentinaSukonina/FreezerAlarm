package com.example.backend.controller;

import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.FreezerUserDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.FreezerUser;
import com.example.backend.repository.FreezerUserRepository;
import com.example.backend.service.FreezerUserService;
import com.example.backend.mapper.FreezerUserMapper;
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

    @PostMapping
    public ResponseEntity<FreezerUserDTO> bindUserToFreezer(@RequestBody FreezerUserRequest request) {
        FreezerUser freezerUser = freezerUserService.bindUserToFreezer(request.getUserId(), request.getFreezerId());
        // Create the DTO record from the entity's fields.
        FreezerUserDTO dto = new FreezerUserDTO(
                freezerUser.getId(),
                freezerUser.getUser().getId(),
                freezerUser.getFreezer().getId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    // DTO class to receive JSON input
    @Getter
    public static class FreezerUserRequest {
        private Long userId;
        private Long freezerId;
        private Long oldFreezerId; // Optional, only used for updates

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public void setFreezerId(Long freezerId) {
            this.freezerId = freezerId;
        }

        public void setOldFreezerId(Long oldFreezerId) {
            this.oldFreezerId = oldFreezerId;
        }
    }

    // DELETE User-Freezer Association
    @DeleteMapping
    public ResponseEntity<String> unbindUserFromFreezer(@RequestBody FreezerUserRequest request) {
        freezerUserService.unbindUserFromFreezer(request.getUserId(), request.getFreezerId());
        return ResponseEntity.ok("User " + request.getUserId() + " unbound from Freezer " + request.getFreezerId());
    }

    //Update User-Freezer Association
    @PutMapping
    public ResponseEntity<FreezerUserDTO> updateFreezerUser(@RequestBody FreezerUserRequest request) {
        if (request.getOldFreezerId() == null) {
            return ResponseEntity.badRequest().build();
        }

        FreezerUser updatedFreezerUser = freezerUserService.updateFreezerUser(
                request.getUserId(), request.getOldFreezerId(), request.getFreezerId()
        );
        FreezerUserDTO responseDto = new FreezerUserDTO(
                updatedFreezerUser.getId(),
                updatedFreezerUser.getUser().getId(),
                updatedFreezerUser.getFreezer().getId()
        );
        return ResponseEntity.ok(responseDto);
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

}