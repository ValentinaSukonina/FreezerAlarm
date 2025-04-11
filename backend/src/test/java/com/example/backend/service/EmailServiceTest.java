package com.example.backend.service;

import com.example.backend.controller.EmailController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;



@AutoConfigureMockMvc(addFilters = false)  // <--- disable Spring Security
@WebMvcTest(EmailController.class)
public class EmailServiceTest {

    @Autowired
    private MockMvc mockMvc;  // <-- this is what was missing

    @SuppressWarnings("removal")
    @MockBean
    private EmailService emailService;

    @Test
    @DisplayName("POST /api/email/send should return confirmation")
    public void testEmailSending() throws Exception {
        doNothing().when(emailService).sendEmail(anyString(), anyString(), anyString());

        mockMvc.perform(post("/api/email/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "to": "test@example.com",
                                "subject": "Hello",
                                "body": "This is a test email."
                            }
                        """))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Email sent")));
    }
}
