package com.example.backend.dto;

import java.util.List;

public record FreezerWithUsersDTO(
        Long id,
        String file,
        String number,
        String address,
        String room,
        String type,
        List<Long> userIds,     // for POST, Used when posting from frontend
        List<UserDTO> users     // for GETUsed when returning from backend
) {
}


