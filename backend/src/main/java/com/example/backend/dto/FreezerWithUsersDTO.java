package com.example.backend.dto;

import java.util.List;

public record FreezerWithUsersDTO(
        Long id,
        String file,
        String number,
        String address,
        String room,
        String type,
        List<UserDTO> users // <--- "users" array in JSON
) {
}

