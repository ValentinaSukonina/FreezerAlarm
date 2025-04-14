package com.example.backend.config;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
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

    @BeforeEach
    void setupTestUsers() {
        // Ensure test users exist in H2
        if (userRepository.findByEmail("user@example.com").isEmpty()) {
            userRepository.save(User.builder()
                    .name("Regular User")
                    .phoneNumber("000111222")
                    .email("user@example.com")
                    .user_rank(1)
                    .role("USER")
                    .build());
        }

        if (userRepository.findByEmail("admin@example.com").isEmpty()) {
            userRepository.save(User.builder()
                    .name("Admin User")
                    .phoneNumber("999888777")
                    .email("admin@example.com")
                    .user_rank(10)
                    .role("ADMIN")
                    .build());
        }
    }

    // === These 3 tests verify pre-authenticated redirect ===

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

    // === These test the OAuth2User after Google redirects ===

    @Test
    void oauth2CallbackWithKnownUserRedirectsToFreezers() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("preAuthorizedEmail", "user@example.com");

        OAuth2User oauthUser = new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("email", "user@example.com", "name", "Regular User"),
                "email"
        );

        mockMvc.perform(get("/login/oauth2/code/google")
                        .session(session)
                        .with(oauth2Login().oauth2User(oauthUser)))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("http://localhost:5173/freezers"));
    }


    @Test
    void oauthLoginWithAdminRedirectsToFreezers() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("preAuthorizedEmail", "admin@example.com");

        OAuth2User oauthUser = new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_ADMIN")),
                Map.of("email", "admin@example.com", "name", "Admin User"),
                "email"
        );

        mockMvc.perform(get("/freezers")
                        .with(oauth2Login().oauth2User(oauthUser))
                        .session(session))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("http://localhost:5173/freezers"));
    }

    @Test
    void oauth2CallbackWithUnknownUserRedirectsToUnauthorized() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("preAuthorizedEmail", "ghost@example.com");

        OAuth2User oauthUser = new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("email", "ghost@example.com", "name", "Ghost User"),
                "email"
        );

        mockMvc.perform(get("/login/oauth2/code/google")
                        .session(session)
                        .with(oauth2Login().oauth2User(oauthUser)))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("http://localhost:5173/unauthorized"));
    }
}
