package com.example.backend.controller;

import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.Freezer;
import com.example.backend.entity.FreezerUser;
import com.example.backend.entity.User;
import com.example.backend.mapper.FreezerUserMapper;
import com.example.backend.repository.FreezerUserRepository;
import com.example.backend.service.FreezerUserService;
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
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@SuppressWarnings("removal")
@AutoConfigureMockMvc(addFilters = false)  // <--- disable Spring Security
@WebMvcTest(FreezerUserController.class)
public class FreezerUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FreezerUserService freezerUserService;

    @MockBean
    private FreezerUserRepository freezerUserRepository;

    @MockBean
    private FreezerUserMapper freezerUserMapper;


    @Test
    @DisplayName("POST /api/freezer-user should bind user to freezer")
    void testBindUserToFreezer() throws Exception {
        FreezerUser freezerUser = new FreezerUser();
        freezerUser.setId(1L);

        User user = new User();
        user.setId(2L);
        freezerUser.setUser(user);

        Freezer freezer = new Freezer();
        freezer.setId(3L);
        freezerUser.setFreezer(freezer);

        when(freezerUserService.bindUserToFreezer(2L, 3L)).thenReturn(freezerUser);

        String json = """
            {
                "userId": 2,
                "freezerId": 3
            }
        """;

        mockMvc.perform(post("/api/freezer-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId", is(2)))
                .andExpect(jsonPath("$.freezerId", is(3)));
    }

    @Test
    @DisplayName("PUT /api/freezer-user should update freezer-user binding")
    void testUpdateFreezerUser() throws Exception {
        FreezerUser updated = new FreezerUser();
        updated.setId(5L);

        User user = new User();
        user.setId(2L);
        updated.setUser(user);

        Freezer freezer = new Freezer();
        freezer.setId(4L);
        updated.setFreezer(freezer);

        when(freezerUserService.updateFreezerUser(2L, 3L, 4L)).thenReturn(updated);

        String json = """
            {
                "userId": 2,
                "freezerId": 4,
                "oldFreezerId": 3
            }
        """;

        mockMvc.perform(put("/api/freezer-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId", is(2)))
                .andExpect(jsonPath("$.freezerId", is(4)));
    }

    @Test
    @DisplayName("GET /api/freezer-user/freezers/{userId} should return list of freezers")
    void testGetFreezersByUserId() throws Exception {
        FreezerDTO freezer = new FreezerDTO(1L, "file1", "1234", "Cold St", "Room A", "-80");
        when(freezerUserService.getFreezersByUserId(2L)).thenReturn(List.of(freezer));

        mockMvc.perform(get("/api/freezer-user/freezers/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].number").value("1234"));
    }

    @Test
    @DisplayName("GET /api/freezer-user/users/{freezerNumber} should return list of users")
    void testGetUsersByFreezerNumber() throws Exception {
        UserDTO user = new UserDTO(
                1L,
                "Alice Bean",
                "0734567898",
                "alice@example.com",
                1,
                 "admin" // role added correctly
        );

        when(freezerUserService.getUsersByFreezerNumber("1234")).thenReturn(List.of(user));

        mockMvc.perform(get("/api/freezer-user/users/1234"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("alice@example.com"))
                .andExpect(jsonPath("$[0].role").value("admin"));
    }


    @Test
    @DisplayName("DELETE /api/freezer-user/users/{userId}/freezers/{freezerId} should unbind successfully")
    void testRemoveFreezerFromUser_success() throws Exception {
        mockMvc.perform(delete("/api/freezer-user/users/2/freezers/3"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PUT /api/freezer-user without oldFreezerId should return 400")
    void testUpdateFreezerUser_badRequest() throws Exception {
        String json = """
        {
            "userId": 2,
            "freezerId": 4
        }
    """;

        mockMvc.perform(put("/api/freezer-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/freezer-user/users/{userId}/freezers/{freezerId} should return 500 on failure")
    void testRemoveFreezerFromUser_failure() throws Exception {
        doThrow(new RuntimeException("Something went wrong"))
                .when(freezerUserService).unbindUserFromFreezer(2L, 3L);

        mockMvc.perform(delete("/api/freezer-user/users/2/freezers/3"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Error removing freezer"));
    }


}


