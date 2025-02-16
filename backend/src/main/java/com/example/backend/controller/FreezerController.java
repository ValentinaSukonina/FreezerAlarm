package com.example.backend.controller;

import com.example.backend.dto.FreezerDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.repository.FreezerRepository;
import com.example.backend.service.FreezerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/freezers")
public class FreezerController {

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

    // GET FREEZER BY FREEZER NUMBER
    @GetMapping("/number/{number}")
    public ResponseEntity<Freezer> findByNumber(@PathVariable String number) {
        Freezer freezer = freezerService.findByNumber(number);
        return ResponseEntity.ok(freezer);
    }

    // GET FREEZER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Freezer> findById(@PathVariable Long id) {
        Freezer freezer = freezerService.findById(id);
        return ResponseEntity.ok(freezer);
    }

    // GET ALL FREEZERS
    @GetMapping
    public ResponseEntity<List<Freezer>> getAllFreezers() {
        List<Freezer> freezers = freezerService.findAll();
        return ResponseEntity.ok(freezers);
    }

    // GET ALL FREEZERS WITH USERS
    @GetMapping("/with-users")
    public ResponseEntity<List<FreezerDTO>> getAllFreezersWithUsers() {
        List<FreezerDTO> freezerDTOs = freezerService.getAllFreezersWithUsers();
        return ResponseEntity.ok(freezerDTOs);
    }

    // UPDATE FREEZER DETAILS BY FREEZER NUMBER
    @PutMapping("/number/{number}")
    public ResponseEntity<Freezer> updateFreezerDetailsByNumber(@PathVariable String number, @Validated @RequestBody Freezer freezer) {
        Freezer updatedFreezer = freezerService.updateFreezerDetailsByNumber(number, freezer);
        return ResponseEntity.ok(updatedFreezer);
    }

    @DeleteMapping("/number/{number}")
    public ResponseEntity<Void> deleteFreezerByNumber(@PathVariable String number) {
        freezerService.deleteFreezerByNumber(number);
        return ResponseEntity.noContent().build();
    }

}






