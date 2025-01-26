package com.example.backend.controller;

import com.example.backend.Dto.FreezerDto;
import com.example.backend.entity.Freezer;
import com.example.backend.service.FreezerService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/freezers")
public class FreezerController {

    private final FreezerService freezerService;

    public FreezerController(FreezerService freezerService) {
        this.freezerService = freezerService;
    }

    @GetMapping("/active")
    public ResponseEntity<List<Freezer>> getActiveFreezers() {
        List<Freezer> freezers = freezerService.findAllActive();
        return ResponseEntity.ok(freezers);
    }

    // GET ALL FREEZERS
    @GetMapping("/all")
    public ResponseEntity<List<Freezer>> getAllFreezers() {
        List<Freezer> freezers = freezerService.findAll();
        return ResponseEntity.ok(freezers);
    }

    // GET FREEZER BY FREEZER NUMBER
    @GetMapping("/number/{freezerNumber}")
    public ResponseEntity<Freezer> getFreezerByNumber(@PathVariable String freezerNumber) {
        Freezer freezer = freezerService.findByFreezerNumber(freezerNumber);
        return ResponseEntity.ok(freezer);
    }

    // GET FREEZER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Freezer> getFreezerById(@PathVariable Long id) {
        Freezer freezer = freezerService.findById(id);
        return ResponseEntity.ok(freezer);
    }

    // GET FREEZERS BY TYPE
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Freezer>> getFreezersByType(@PathVariable String type) {
        List<Freezer> freezers = freezerService.findByType(type);
        return ResponseEntity.ok(freezers);
    }

    // GET FREEZERS BY ROOM
    @GetMapping("/room/{room}")
    public ResponseEntity<List<Freezer>> getFreezersByRoom(@PathVariable String room) {
        List<Freezer> freezers = freezerService.findByRoom(room);
        return ResponseEntity.ok(freezers);
    }

    // CREATE FREEZER
    @PostMapping
    public ResponseEntity<Freezer> createFreezer(@Validated @RequestBody FreezerDto freezerDto) {
        Freezer createdFreezer = freezerService.createFreezer(freezerDto);
        return ResponseEntity.ok(createdFreezer);
    }

    // UPDATE FREEZER
    @PutMapping("/{id}")
    public ResponseEntity<Freezer> updateFreezer(
            @PathVariable Long id,
            @Validated @RequestBody FreezerDto freezerDto) {
        freezerDto.setId(id); // Ensure the path variable ID matches the DTO ID
        Freezer updatedFreezer = freezerService.updateFreezer(freezerDto);
        return ResponseEntity.ok(updatedFreezer);
    }

    // SOFT DELETE FREEZER
    @DeleteMapping("/{freezerNumber}")
    public ResponseEntity<String> softDeleteFreezer(@PathVariable String freezerNumber) {
        freezerService.softDeleteFreezer(freezerNumber);
        return ResponseEntity.ok("Freezer with number " + freezerNumber + " soft deleted successfully.");
    }
}
