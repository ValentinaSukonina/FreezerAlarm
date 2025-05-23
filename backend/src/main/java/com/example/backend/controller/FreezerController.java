package com.example.backend.controller;

import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.FreezerWithUsersDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.exception.Exceptions;
import com.example.backend.exception.GlobalExceptionHandler;
import com.example.backend.repository.FreezerRepository;
import com.example.backend.service.FreezerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/freezers")
public class FreezerController {
    private static final Logger logger = LoggerFactory.getLogger(FreezerController.class);
    private final FreezerService freezerService;
    private final FreezerRepository freezerRepository;


    public FreezerController(FreezerService freezerService,
                             FreezerRepository freezerRepository) {
        this.freezerService = freezerService;
        this.freezerRepository = freezerRepository;
    }

    // CREATE FREEZER
    @PostMapping
    public ResponseEntity<Freezer> createFreezer(@Validated @RequestBody Freezer freezer) {
        Freezer createdFreezer = (Freezer) freezerService.createFreezer(freezer);
        return ResponseEntity.created(URI.create("/api/freezers/" + ((Freezer) createdFreezer).getId())).body(createdFreezer);
    }

    // GET FREEZER BY NUMBER WITHOUT USERS
    @GetMapping("/number/{number}")
    public ResponseEntity<FreezerDTO> findByNumber(@PathVariable String number) {
        FreezerDTO dto = freezerService.findByNumber(number);
        return ResponseEntity.ok(dto);
    }

    // GET FREEZER BY NUMBER WITH USERS
    @GetMapping("/number/{number}/with-users")
    public ResponseEntity<FreezerWithUsersDTO> findByNumberWithUsers(@PathVariable String number) {
        FreezerWithUsersDTO dto = freezerService.findByNumberWithUsers(number);
        return ResponseEntity.ok(dto);
    }

    // GET FREEZER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<FreezerDTO> findById(@PathVariable Long id) {
        FreezerDTO dto = freezerService.findById(id);
        return ResponseEntity.ok(dto);
    }

    // GET ALL FREEZERS WITH USERS (Convert to DTO)
    @GetMapping
    public ResponseEntity<List<FreezerWithUsersDTO>> getAllFreezersWithUsers() {
        List<FreezerWithUsersDTO> freezers = freezerService.getAllFreezersWithUsers();
        return ResponseEntity.ok(freezers);
    }

    // UPDATE FREEZER DETAILS BY FREEZER NUMBER
    @PutMapping("/number/{number}")
    public ResponseEntity<FreezerDTO> updateFreezerDetailsByNumber(@PathVariable String number, @Validated @RequestBody Freezer freezer) {
        FreezerDTO updatedFreezer = freezerService.updateFreezerDetailsByNumber(number, freezer);
        return ResponseEntity.ok(updatedFreezer);
    }

    @DeleteMapping("/number/{number}")
    public ResponseEntity<Void> deleteFreezerByNumber(@PathVariable String number) {
        freezerService.deleteFreezerByNumber(number);
        return ResponseEntity.noContent().build();
    }

    //  Update freezer by ID (used by frontend)
    @PutMapping("/{id}/with-users")
    public ResponseEntity<FreezerWithUsersDTO> updateFreezerWithUsers(
            @PathVariable Long id,
            @RequestBody FreezerWithUsersDTO dto
    ) {
        try {
            FreezerWithUsersDTO updated = freezerService.updateFreezerAndUsers(id, dto);
            return ResponseEntity.ok(updated);
        } catch (Exceptions.ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //  Delete freezer by ID (used by frontend)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFreezerById(@PathVariable Long id) {
        if (!freezerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        freezerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // CREATE FREEZER WITH USERS
    @PostMapping("/with-users")
    public ResponseEntity<?> createFreezerWithUsers(@RequestBody FreezerWithUsersDTO dto) {
        try {
            FreezerWithUsersDTO created = freezerService.createFreezerWithUsers(dto);
            return ResponseEntity.created(URI.create("/api/freezers/number/" + created.number())).body(created);
        } catch (GlobalExceptionHandler.BadRequestException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


}