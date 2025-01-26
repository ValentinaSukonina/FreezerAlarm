package com.example.backend.controller;

import com.example.backend.entity.FreezerUser;
import com.example.backend.service.FreezerUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/freezer-user")

public class FreezerUserController {

    private final FreezerUserService freezerUserService;

    public FreezerUserController(FreezerUserService freezerUserService) {
        this.freezerUserService = freezerUserService;
    }

/*    @GetMapping("/find")
    public ResponseEntity<FreezerUser> findFreezerUser(@RequestParam String freezerNumber, @RequestParam String userName) {
        return freezerUserService.getFreezerUser(freezerNumber, userName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }*/
}
