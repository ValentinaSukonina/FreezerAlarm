package com.example.backend.Dto;

import com.example.backend.entity.Freezer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
public class FreezerDto {
    @NotNull(message = "Freezer ID is required")
    private Long id;

    @NotBlank(message = "File name cannot be blank")
    private String fileName;

    @NotBlank(message = "Freezer number cannot be blank")
    @Size(min = 4, max = 4, message = "Freezer number must be exactly 4 characters long")
    private String freezerNumber;

    @NotBlank(message = "Address cannot be blank")
    @Size(max = 50, message = "Address must not exceed 50 characters")
    private String address;

    @NotBlank(message = "Room cannot be blank")
    @Size(max = 10, message = "Room must not exceed 10 characters")
    private String room;

    @NotBlank(message = "Type cannot be blank")
    private String type;

    public Freezer toEntity() {
        Freezer freezer = new Freezer();
        freezer.setId(id); // Include the ID field
        freezer.setFileName(fileName);
        freezer.setFreezerNumber(freezerNumber);
        freezer.setAddress(address);
        freezer.setRoom(room);
        freezer.setType(type);
        return freezer;
    }
}

