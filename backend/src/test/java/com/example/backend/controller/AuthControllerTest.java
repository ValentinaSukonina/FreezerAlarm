package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)  // <--- disable Spring Security
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @SuppressWarnings("removal")
    @MockBean
    private UserRepository userRepository;


    @Test
    void checkUserAuthorization_shouldReturnTrueIfUserExists() throws Exception {
        Mockito.when(userRepository.findByNameAndEmail("testuser", "test@example.com"))
                .thenReturn(Optional.of(new User()));


        mockMvc.perform(get("/api/auth/check-user")
                        .param("name", "testuser")
                        .param("email", "test@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }

    @Test
    void checkUserAuthorization_shouldReturnFalseIfUserNotExists() throws Exception {
        Mockito.when(userRepository.findByNameAndEmail("nonexistent", "nobody@example.com"))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/auth/check-user")
                        .param("name", "nonexistent")
                        .param("email", "nobody@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().string("false"));
    }

    @Test
    void setPreAuthorizedEmail_shouldStoreEmailInSession() throws Exception {
        mockMvc.perform(post("/api/auth/set-preauth-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"user@example.com\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void getUserRole_shouldReturnRoleFromSession() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("role", "admin");

        mockMvc.perform(get("/api/auth/role").session(session))
                .andExpect(status().isOk())
                .andExpect(content().string("admin"));
    }

    @Test
    void getSessionUser_shouldReturnAllSessionAttributes() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("username", "lucia");
        session.setAttribute("role", "admin");
        session.setAttribute("email", "lucia@example.com");
        session.setAttribute("isLoggedIn", true);

        mockMvc.perform(get("/api/auth/session-user").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("lucia"))
                .andExpect(jsonPath("$.role").value("admin"))
                .andExpect(jsonPath("$.email").value("lucia@example.com"))
                .andExpect(jsonPath("$.isLoggedIn").value(true));
    }

    @Test
    void handleOAuthCallback_shouldReturnAuthCode() throws Exception {
        mockMvc.perform(get("/api/auth/oauth2callback")
                        .param("code", "abc123"))
                .andExpect(status().isOk())
                .andExpect(content().string("Your auth code is: abc123"));
    }

    @Test
    void handleOAuthCallback_shouldReturnErrorIfMissingCode() throws Exception {
        mockMvc.perform(get("/api/auth/oauth2callback"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("No code received."));
    }

    @Test
    void handleOAuthCallback_shouldReturnErrorMessageFromGoogle() throws Exception {
        mockMvc.perform(get("/api/auth/oauth2callback")
                        .param("error", "access_denied"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error from Google: access_denied"));
    }
}

