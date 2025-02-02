package com.example.backend.controller;

import com.example.backend.entity.Freezer;
import com.example.backend.entity.FreezerUser;
import com.example.backend.repository.FreezerRepository;
import com.example.backend.repository.FreezerUserRepository;
import com.example.backend.service.FreezerService;
import com.example.backend.service.FreezerUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/freezer-user")
public class FreezerUserController {
    private final FreezerUserService freezerUserService;
    private final FreezerUserRepository freezerUserRepository;
    public FreezerUserController(FreezerUserService freezerUserService, FreezerUserRepository freezerUserRepository) {
        this.freezerUserService = freezerUserService;
        this.freezerUserRepository = freezerUserRepository;
    }

    @PostMapping
    public ResponseEntity<FreezerUser> bindUserToFreezer(@RequestBody FreezerUserRequest request) {
        FreezerUser freezerUser = freezerUserService.bindUserToFreezer(request.getUserId(), request.getFreezerId());
        return ResponseEntity.status(HttpStatus.CREATED).body(freezerUser);
    }

    // DTO class to receive JSON input
    public static class FreezerUserRequest {
        private Long userId;
        private Long freezerId;
        private Long oldFreezerId; // Optional, only used for updates

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public Long getFreezerId() { return freezerId; }
        public void setFreezerId(Long freezerId) { this.freezerId = freezerId; }

        public Long getOldFreezerId() { return oldFreezerId; }
        public void setOldFreezerId(Long oldFreezerId) { this.oldFreezerId = oldFreezerId; }
    }


    // DELETE User-Freezer Association
    @DeleteMapping
    public ResponseEntity<String> unbindUserFromFreezer(@RequestBody FreezerUserRequest request) {
        freezerUserService.unbindUserFromFreezer(request.getUserId(), request.getFreezerId());
        return ResponseEntity.ok("User " + request.getUserId() + " unbound from Freezer " + request.getFreezerId());
    }

    //Update User-Freezer Association
    @PutMapping
    public ResponseEntity<FreezerUser> updateFreezerUser(@RequestBody FreezerUserRequest request) {
        if (request.getOldFreezerId() == null) {
            return ResponseEntity.badRequest().body(null);
        }

        FreezerUser updatedFreezerUser = freezerUserService.updateFreezerUser(
                request.getUserId(), request.getOldFreezerId(), request.getFreezerId()
        );
        return ResponseEntity.ok(updatedFreezerUser);
    }

}




