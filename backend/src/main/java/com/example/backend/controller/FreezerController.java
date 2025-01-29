package com.example.backend.controller;

import com.example.backend.entity.Freezer;
import com.example.backend.repository.FreezerRepository;
import com.example.backend.service.FreezerService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

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
        return ResponseEntity.created(URI.create("/api/freezers/" + ((Freezer)createdFreezer).getId())).body(createdFreezer);
    }

    // GET FREEZER BY FREEZER NUMBER
    @GetMapping("/number/{number}")
    public ResponseEntity<Freezer> findByNumber(@PathVariable String number) {
        Freezer freezer = freezerService.findByNumber(number);
        return ResponseEntity.ok(freezer);
    }

    }/*
    // GET FREEZER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Freezer> getFreezerById(@PathVariable Long id) throws Throwable {
        Freezer freezer = freezerService.findById(id);
        return ResponseEntity.ok(freezer);
    }

 */

