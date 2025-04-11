package com.example.backend.controller;


import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.FreezerWithUsersDTO;
import com.example.backend.repository.FreezerRepository;
import com.example.backend.service.FreezerService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SuppressWarnings("removal")
@AutoConfigureMockMvc(addFilters = false)  // <--- disable Spring Security
@WebMvcTest(FreezerController.class)
public class FreezerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FreezerService freezerService;

    @MockBean
    private FreezerRepository freezerRepository;

    @Test
    @DisplayName("GET /api/freezers/number/ABC123 should return freezer DTO")
    void testFindByNumber() throws Exception {
        FreezerDTO dto = new FreezerDTO(
                1L,
                "file123.png",
                "ABC123",
                "123 Cold St",
                "Room A",
                "-80"
        );

        when(freezerService.findByNumber("ABC123")).thenReturn(dto);

        mockMvc.perform(get("/api/freezers/number/ABC123"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.number", is("ABC123")))
                .andExpect(jsonPath("$.address", is("123 Cold St")))
                .andExpect(jsonPath("$.file", is("file123.png")))
                .andExpect(jsonPath("$.room", is("Room A")))
                .andExpect(jsonPath("$.type", is("-80")));
    }

    @Test
    @DisplayName("GET /api/freezers should return list of freezers")
    void testGetAllFreezersWithUsers() throws Exception {
        FreezerWithUsersDTO dto = new FreezerWithUsersDTO(
                1L,
                "DEF456",       // file
                "Main Freezer", // number
                "123 Cold St",  // address
                "Room A",       // room
                "-80",          // type
                List.of(1L, 2L), // userIds
                List.of()       // users (could be List.of(new UserDTO(...)) if needed)
        );

        when(freezerService.getAllFreezersWithUsers()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/freezers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].number").value("Main Freezer"))
                .andExpect(jsonPath("$[0].address").value("123 Cold St"));
    }


    @Test
    @DisplayName("DELETE /api/freezers/99 should return 404 if not found")
    void testDeleteFreezerById_notFound() throws Exception {
        when(freezerRepository.existsById(99L)).thenReturn(false);

        mockMvc.perform(delete("/api/freezers/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/freezers/1 should return 204 if deleted")
    void testDeleteFreezerById_success() throws Exception {
        when(freezerRepository.existsById(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/freezers/1"))
                .andExpect(status().isNoContent());
    }

    @DisplayName("GET /api/freezers/number/{number}/with-users returns FreezerWithUsersDTO")
    @Test
    void testFindByNumberWithUsers() throws Exception {
        FreezerWithUsersDTO dto = new FreezerWithUsersDTO(
                1L, "file456", "DEF123", "Cool Address", "B1", "-20", List.of(), List.of()
        );

        when(freezerService.findByNumberWithUsers("DEF123")).thenReturn(dto);

        mockMvc.perform(get("/api/freezers/number/DEF123/with-users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.number").value("DEF123"));
    }

    @DisplayName("GET /api/freezers/{id} should return freezer DTO by ID")
    @Test
    void testFindById() throws Exception {
        FreezerDTO dto = new FreezerDTO(1L, "file.png", "NUM1", "Address", "Room B", "-70");

        when(freezerService.findById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/freezers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @DisplayName("PUT /api/freezers/number/{number} should update and return freezer DTO")
    @Test
    void testUpdateFreezerDetailsByNumber() throws Exception {
        FreezerDTO updated = new FreezerDTO(1L, "updated.png", "1111", "Updated Address", "Room Z", "-60");

        when(freezerService.updateFreezerDetailsByNumber(eq("1111"), any())).thenReturn(updated);

        mockMvc.perform(put("/api/freezers/number/1111")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "file": "updated.png",
                          "number": "1111",
                          "address": "Updated Address",
                          "room": "Room Z",
                          "type": "-60"
                        }
                    """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.address").value("Updated Address"));
    }


}
