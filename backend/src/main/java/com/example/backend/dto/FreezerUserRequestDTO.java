package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FreezerUserRequestDTO {
    private Long id;
    private Long userId;
    private Long freezerId;
    private Long oldFreezerId;
    private List<Long> userIds;
}
