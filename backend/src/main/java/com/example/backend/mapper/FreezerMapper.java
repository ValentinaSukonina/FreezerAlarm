package com.example.backend.mapper;

import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.FreezerWithUsersDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.entity.User;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class FreezerMapper {

    public FreezerDTO toFreezerDTO(Freezer freezer) {
        if (freezer == null) {
            return null;
        }

        return new FreezerDTO(
                freezer.getId(),
                freezer.getFile(),
                freezer.getNumber(),
                freezer.getAddress(),
                freezer.getRoom(),
                freezer.getType()
        );
    }

    public FreezerWithUsersDTO toFreezerWithUsersDTO(Freezer freezer) {
        if (freezer == null) {
            return null;
        }

        List<UserDTO> userDTOs = freezer.getFreezerUsers().stream()
                .sorted(Comparator.comparingInt(fu -> {
                    Integer rank = fu.getUser().getUser_rank();
                    return rank != null ? rank : Integer.MAX_VALUE;
                })).map(fu -> {
                    User user = fu.getUser();
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

        List<Long> userIds = freezer.getFreezerUsers().stream()
                .map(fu -> fu.getUser().getId())
                .toList();

        return new FreezerWithUsersDTO(
                freezer.getId(),
                freezer.getFile(),
                freezer.getNumber(),
                freezer.getAddress(),
                freezer.getRoom(),
                freezer.getType(),
                userIds,
                userDTOs
        );
    }

    public Freezer fromFreezerWithUsersDTO(FreezerWithUsersDTO dto) {
        if (dto == null) {
            return null;
        }

        Freezer freezer = new Freezer();
        freezer.setId(dto.id()); // optional
        freezer.setFile(dto.file());
        freezer.setNumber(dto.number());
        freezer.setAddress(dto.address());
        freezer.setRoom(dto.room());
        freezer.setType(dto.type());

        return freezer;
    }

}