package com.example.backend.dto;


public record FreezerDTO(
        Long id,
        String file,
        String number,
        String address,
        String room,
        String type) {
}
