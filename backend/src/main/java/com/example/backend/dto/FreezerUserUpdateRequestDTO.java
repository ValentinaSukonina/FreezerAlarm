package com.example.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FreezerUserUpdateRequestDTO {
    private Long freezerId;
    private List<Long> userIds;
}
