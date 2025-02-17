package com.example.backend.mapper;

import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {
    public UserDTO toUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        return dto;
    }

    public List<UserDTO> toUserDTOList(List<User> users) {
        return users.stream().map(this::toUserDTO).collect(Collectors.toList());
    }
}

