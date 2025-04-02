package com.example.backend.mapper;

import com.example.backend.dto.FreezerUserDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.entity.FreezerUser;
import com.example.backend.entity.User;
import org.springframework.stereotype.Component;

@Component
public class FreezerUserMapper {

    public FreezerUserDTO toDTO(FreezerUser freezerUser) {
        if (freezerUser == null) return null;

        return new FreezerUserDTO(
                freezerUser.getId(),
                freezerUser.getUser().getId(),
                freezerUser.getFreezer().getId()
        );
    }

    public FreezerUser fromDTO(FreezerUserDTO dto, User user, Freezer freezer) {
        if (dto == null || user == null || freezer == null) return null;

        FreezerUser freezerUser = new FreezerUser();
        freezerUser.setId(dto.id()); // Optional for updates
        freezerUser.setUser(user);
        freezerUser.setFreezer(freezer);
        return freezerUser;
    }
}