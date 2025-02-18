package com.example.backend.dto;

public record UserDTO(
        Long id,
        String name,
        String phone_number,
        String email,
        Integer user_rank,
        String role
) {
}