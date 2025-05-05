package com.example.backend.controller;

import com.example.backend.service.EmailService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SuppressWarnings("removal")
@AutoConfigureMockMvc(addFilters = false)  // <--- disable Spring Security
@WebMvcTest(EmailController.class)
public class EmailControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmailService emailService;

    @Test
    @DisplayName("POST /api/email/send - success")
    void testSendEmailSuccess() throws Exception {
        doNothing().when(emailService).sendEmail("test@example.com", "Subject", "Hello");

        String json = """
                    {
                        "to": "test@example.com",
                        "subject": "Subject",
                        "body": "Hello"
                    }
                """;

        mockMvc.perform(post("/api/email/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(content().string("Email sent to test@example.com"));
    }

    @Test
    @DisplayName("POST /api/email/send - failure")
    void testSendEmailFailure() throws Exception {
        doThrow(new RuntimeException("SMTP error")).when(emailService)
                .sendEmail("fail@example.com", "Oops", "Failure body");

        String json = """
                    {
                        "to": "fail@example.com",
                        "subject": "Oops",
                        "body": "Failure body"
                    }
                """;

        mockMvc.perform(post("/api/email/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Failed to send email: SMTP error"));
    }
}