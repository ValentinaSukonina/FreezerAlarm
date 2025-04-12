package com.example.backend.controller;

import com.example.backend.dto.FreezerDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.entity.User;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.FreezerService;
import com.example.backend.service.FreezerUserService;
import com.example.backend.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SuppressWarnings("removal")
@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;


    @MockBean private UserService userService;
    @MockBean private UserRepository userRepository;
    @MockBean private UserMapper userMapper;
    @MockBean private FreezerUserService freezerUserService;
    @MockBean private FreezerService freezerService;

    @Test
    @DisplayName("POST /api/users should create user")
    void testCreateUser() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setName("John");

        when(userService.createUser(user)).thenReturn(user);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "name": "John"
                            }
                        """))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("GET /api/users should return list of users")
    void testGetAllUsers() throws Exception {
        UserDTO userDTO = new UserDTO(1L, "John", "0700000000", "john@example.com", 1, "user");
        when(userService.getAllUsers()).thenReturn(List.of(userDTO));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", is("John")));
    }

    @Test
    @DisplayName("GET /api/users/{id} should return user")
    void testGetUserById() throws Exception {
        UserDTO userDTO = new UserDTO(1L, "Alice", "0700001111", "alice@example.com", 2, "admin");
        when(userService.getUserById(1L)).thenReturn(userDTO);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Alice")));
    }

    @Test
    @DisplayName("POST /api/users/check-user should return existence flag")
    void testCheckUser() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setName("Bob");

        when(userService.findByName("Bob")).thenReturn(Optional.of(user));

        mockMvc.perform(post("/api/users/check-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "name": "Bob"
                            }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists", is(true)));
    }

    @Test
    @DisplayName("DELETE /api/users/{id} - user exists and is deleted")
    void testDeleteUser_success() throws Exception {
        when(userRepository.existsById(1L)).thenReturn(true);
        doNothing().when(userService).deleteUserById(1L);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/users/{id} - user does not exist")
    void testDeleteUser_notFound() throws Exception {
        when(userRepository.existsById(99L)).thenReturn(false);

        mockMvc.perform(delete("/api/users/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/users/user with authenticated principal")
    void testGetAuthenticatedUser() throws Exception {
        mockMvc.perform(get("/api/users/user")
                        .principal(() -> "testUser"))  // <-- this mocks a Principal
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("testUser"));  // because Principal#getName() returns "testUser"
    }


    @Test
    @DisplayName("GET /api/users/by-name/{username} should return user DTO")
    void testGetUserByName() throws Exception {
        User user = new User();
        user.setName("lucia");
        UserDTO userDTO = new UserDTO(1L, "lucia", "0701234567", "lucia@example.com", 3, "admin");

        when(userService.findByName("lucia")).thenReturn(Optional.of(user));
        when(userMapper.toUserDTO(user)).thenReturn(userDTO);

        mockMvc.perform(get("/api/users/by-name/lucia"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("lucia")));
    }

    @Test
    @DisplayName("PUT /api/users/{id} should update user")
    void testUpdateUser() throws Exception {
        User user = new User();
        user.setName("UpdatedName");

        when(userRepository.existsById(1L)).thenReturn(true);
        when(userService.updateUser(1L, user)).thenReturn(user);

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "name": "UpdatedName"
                            }
                        """))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/users/{userId}/freezers should return user's freezers")
    void testGetFreezersByUserId() throws Exception {
        FreezerDTO freezer = new FreezerDTO(1L, "file1", "FZ123", "Cold Ave", "Room 2", "-80");
        when(freezerService.getFreezersByUserId(1L)).thenReturn(List.of(freezer));

        mockMvc.perform(get("/api/users/1/freezers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].number").value("FZ123"));
    }


    @Test
    @DisplayName("DELETE /api/users/{id} - throws exception")
    void testDeleteUser_exception() throws Exception {
        when(userRepository.existsById(1L)).thenReturn(true);
        doThrow(new RuntimeException("fail")).when(userService).deleteUserById(1L);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(containsString("Failed to delete user")));
    }

    @Test
    @DisplayName("GET /api/users - success")
    void testGetAllUsers_success() throws Exception {
        UserDTO userDTO = new UserDTO(1L, "name", "0712345678", "email", 1, "user");
        when(userService.getAllUsers()).thenReturn(List.of(userDTO));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("name"));
    }

    @Test
    @DisplayName("GET /api/users - exception")
    void testGetAllUsers_exception() throws Exception {
        when(userService.getAllUsers()).thenThrow(new RuntimeException());

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(containsString("unexpected error")));
    }

    @Test
    @DisplayName("GET /api/users/{id} - success")
    void testGetUserById_success() throws Exception {
        UserDTO userDTO = new UserDTO(1L, "name", "0712345678", "email", 1, "user");
        when(userService.getUserById(1L)).thenReturn(userDTO);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("name"));
    }

    @Test
    @DisplayName("GET /api/users/{id} - exception")
    void testGetUserById_exception() throws Exception {
        when(userService.getUserById(1L)).thenThrow(new RuntimeException());

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string(containsString("unexpected error")));
    }

    @Test
    @DisplayName("POST /api/users/check-user - user exists")
    void testCheckUser_exists() throws Exception {
        when(userService.findByName("Alice")).thenReturn(Optional.of(new User()));

        mockMvc.perform(post("/api/users/check-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "name": "Alice"
                        }
                    """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(true));
    }

    @Test
    @DisplayName("POST /api/users/check-user - user does not exist")
    void testCheckUser_notExists() throws Exception {
        when(userService.findByName("Alice")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/users/check-user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "name": "Alice"
                        }
                    """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(false));
    }



    @Test
    @DisplayName("GET /api/users/user - unauthenticated")
    void testGetAuthenticatedUser_unauthenticated() throws Exception {
        mockMvc.perform(get("/api/users/user"))
                .andExpect(status().isUnauthorized());
    }




    @Test
    @DisplayName("PUT /api/users/{id} - success")
    void testUpdateUser_success() throws Exception {
        when(userRepository.existsById(1L)).thenReturn(true);
        User updated = new User();
        updated.setId(1L);
        updated.setName("Updated");
        when(userService.updateUser(eq(1L), any())).thenReturn(updated);

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "name": "Updated",
                          "phone_number": "0712345678",
                          "email": "updated@example.com",
                          "user_rank": 1,
                          "role": "user"
                        }
                    """))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PUT /api/users/{id} - not found")
    void testUpdateUser_notFound() throws Exception {
        when(userRepository.existsById(1L)).thenReturn(false);

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/users/{id} - exception")
    void testUpdateUser_exception() throws Exception {
        when(userRepository.existsById(1L)).thenReturn(true);
        when(userService.updateUser(eq(1L), any())).thenThrow(new RuntimeException());

        mockMvc.perform(put("/api/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("GET /api/users/{userId}/freezers - success")
    void testGetFreezersByUserId_success() throws Exception {
        FreezerDTO dto = new FreezerDTO(1L, "file", "123", "addr", "room", "-80");
        when(freezerService.getFreezersByUserId(1L)).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/users/1/freezers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].number").value("123"));
    }

    @Test
    @DisplayName("GET /api/users/{userId}/freezers - no content")
    void testGetFreezersByUserId_noContent() throws Exception {
        when(freezerService.getFreezersByUserId(1L)).thenReturn(List.of());

        mockMvc.perform(get("/api/users/1/freezers"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/users/{userId}/freezers - exception")
    void testGetFreezersByUserId_exception() throws Exception {
        when(freezerService.getFreezersByUserId(1L)).thenThrow(new RuntimeException());

        mockMvc.perform(get("/api/users/1/freezers"))
                .andExpect(status().isInternalServerError());
    }



    /*@Test
    @DisplayName("GET /api/users/user - authenticated")
    void testGetAuthenticatedUser_authenticated() throws Exception {
        Principal mockPrincipal = mock(Principal.class);
        when(mockPrincipal.getName()).thenReturn("user123");
        mockMvc.perform(get("/api/users/user").principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(content().string("user123"));
        verifyNoInteractions(userService); // This confirms it's NOT called
    }*/


}
