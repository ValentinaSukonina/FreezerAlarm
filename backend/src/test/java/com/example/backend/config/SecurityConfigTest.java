package com.example.backend.config;

import com.example.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestConfig.class)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@Transactional
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    void userWithPreAuthorizedEmailCanLogin() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("preAuthorizedEmail", "user@example.com");

        mockMvc.perform(get("/oauth2/authorization/google").session(session))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    void adminWithPreAuthorizedEmailCanLogin() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("preAuthorizedEmail", "admin@example.com");

        mockMvc.perform(get("/oauth2/authorization/google").session(session))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    void unauthorizedEmailShouldBeRejected() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("preAuthorizedEmail", "notindb@example.com");

        mockMvc.perform(get("/oauth2/authorization/google").session(session))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    void logoutWithAuthenticatedUserShouldInvalidateSessionAndLogUser() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("isLoggedIn", "true");
        session.setAttribute("role", "USER");
        session.setAttribute("username", "Regular User");
        session.setAttribute("email", "user@example.com");

        mockMvc.perform(get("/logout")
                        .session(session)
                        .with(user("user@example.com").roles("USER")))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("http://localhost:5173"));
    }

}