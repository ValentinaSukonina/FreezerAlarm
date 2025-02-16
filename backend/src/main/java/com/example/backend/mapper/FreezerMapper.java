package com.example.backend.mapper;

import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FreezerMapper {

    public FreezerDTO toFreezerDTO(Freezer freezer) {
        // Build the list of UserDTOs from the freezer's relationships
        List<UserDTO> userDTOs = freezer.getFreezerUsers().stream()
                .map(freezerUser -> {
                    // In your code, you have a "join" entity called FreezerUser; we pull the actual User from it:
                    User user = freezerUser.getUser();

                    // Return a UserDTO with the exact JSON fields you want
                    return new UserDTO(
                            user.getId(),
                            user.getName(),            // "name"
                            user.getPhoneNumber(),     // "phone_number"
                            user.getEmail(),           // "email"
                            user.getUser_rank(),       // "user_rank"
                            user.getRole()             // "role" (could be hardcoded or read from the DB)
                    );
                })
                .toList();

        // Return a FreezerDTO that includes the list of users
        return new FreezerDTO(
                freezer.getId(),
                freezer.getFile(),
                freezer.getNumber(),
                freezer.getAddress(),
                freezer.getRoom(),
                freezer.getType(),
                userDTOs
        );
    }
}
