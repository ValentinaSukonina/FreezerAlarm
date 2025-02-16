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
        List<UserDTO> userDTOs = freezer.getFreezerUsers().stream()
                .map(freezerUser -> {
                    User user = freezerUser.getUser();

                    return new UserDTO(
                            user.getId(),
                            user.getName(),
                            user.getPhoneNumber(),
                            user.getEmail(),
                            user.getUser_rank(),
                            user.getRole()
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
