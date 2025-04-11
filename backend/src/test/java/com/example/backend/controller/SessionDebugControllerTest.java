package com.example.backend.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import java.security.Principal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@WebMvcTest(SessionDebugController.class)
@AutoConfigureMockMvc(addFilters = false)  // Disable security filters if present
public class SessionDebugControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/session-debug returns session info and principal name")
    void testGetSessionDebug() throws Exception {
        // Mock session with attributes
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("isLoggedIn", true);

        // Mock Principal
        Principal mockPrincipal = () -> "testUser";

        mockMvc.perform(get("/api/session-debug")
                        .session(session)
                        .principal(mockPrincipal)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").value(session.getId()))
                .andExpect(jsonPath("$.isLoggedIn").value(true))
                .andExpect(jsonPath("$.user").value("testUser"));
    }

    @Test
    @DisplayName("GET /api/session-debug returns null user if principal is missing")
    void testGetSessionDebugWithoutPrincipal() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("isLoggedIn", false);

        mockMvc.perform(get("/api/session-debug")
                        .session(session)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user").isEmpty())
                .andExpect(jsonPath("$.isLoggedIn").value(false));
    }
}
