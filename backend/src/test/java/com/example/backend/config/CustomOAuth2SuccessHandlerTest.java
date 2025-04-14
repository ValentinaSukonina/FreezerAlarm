package com.example.backend.config;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CustomOAuth2SuccessHandlerTest {

    private UserRepository userRepository;
    private CustomOAuth2SuccessHandler successHandler;

    private HttpServletRequest request;
    private HttpServletResponse response;
    private HttpSession session;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        successHandler = new CustomOAuth2SuccessHandler(userRepository);

        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        session = mock(HttpSession.class);

        when(request.getSession()).thenReturn(session);
    }

    @Test
    void knownUserShouldRedirectToFreezers() throws Exception {
        String email = "user@example.com";
        String name = "Regular User";

        OAuth2User oAuth2User = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("email", email, "name", name),
                "email"
        );

        when(session.getAttribute("preAuthorizedEmail")).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(
                User.builder()
                        .email(email)
                        .name(name)
                        .phoneNumber("0000000")
                        .role("USER")
                        .user_rank(1)
                        .build()
        ));

        var auth = new UsernamePasswordAuthenticationToken(oAuth2User, null, oAuth2User.getAuthorities());

        successHandler.onAuthenticationSuccess(request, response, auth);

        verify(session).setAttribute("isLoggedIn", "true");
        verify(session).setAttribute("username", name);
        verify(response).sendRedirect("http://localhost:5173/freezers");
    }

    @Test
    void unknownUserShouldRedirectToUnauthorized() throws Exception {
        String email = "unknown@example.com";
        OAuth2User oAuth2User = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("email", email, "name", "Unknown"),
                "email"
        );

        when(session.getAttribute("preAuthorizedEmail")).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        var auth = new UsernamePasswordAuthenticationToken(oAuth2User, null, oAuth2User.getAuthorities());

        successHandler.onAuthenticationSuccess(request, response, auth);

        verify(response).sendRedirect("http://localhost:5173/unauthorized");
    }

    @Test
    void mismatchedEmailShouldInvalidateSessionAndRedirect() throws Exception {
        String email = "intruder@example.com";
        OAuth2User oAuth2User = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("email", email, "name", "Intruder"),
                "email"
        );

        when(session.getAttribute("preAuthorizedEmail")).thenReturn("user@example.com");

        var auth = new UsernamePasswordAuthenticationToken(oAuth2User, null, oAuth2User.getAuthorities());

        successHandler.onAuthenticationSuccess(request, response, auth);

        verify(session).invalidate();
        verify(response).sendRedirect("http://localhost:5173/unauthorized");
    }

    @Test
    void redirectFailureShouldBeCaughtAndLogged() throws Exception {
        String email = "user@example.com";
        String name = "Regular User";

        OAuth2User oAuth2User = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("email", email, "name", name),
                "email"
        );

        when(session.getAttribute("preAuthorizedEmail")).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(
                User.builder()
                        .email(email)
                        .name(name)
                        .phoneNumber("0000000")
                        .role("USER")
                        .user_rank(1)
                        .build()
        ));

        doThrow(new RuntimeException("Simulated redirect failure"))
                .when(response).sendRedirect(anyString());

        var auth = new UsernamePasswordAuthenticationToken(oAuth2User, null, oAuth2User.getAuthorities());

        assertDoesNotThrow(() ->
                successHandler.onAuthenticationSuccess(request, response, auth)
        );

        verify(response).sendRedirect("http://localhost:5173/freezers");
    }

    @Test
    void redirectFailureOnUnknownUserShouldBeCaughtAndLogged() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.getSession().setAttribute("preAuthorizedEmail", "notindb@example.com");

        MockHttpServletResponse response = new MockHttpServletResponse() {
            @Override
            public void sendRedirect(String location) throws IOException {
                throw new IOException("Simulated redirect failure to /unauthorized");
            }
        };

        OAuth2User oauthUser = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("email", "notindb@example.com", "name", "Ghost"),
                "email"
        );

        OAuth2AuthenticationToken token = new OAuth2AuthenticationToken(oauthUser, oauthUser.getAuthorities(), "google");

        assertDoesNotThrow(() ->
                successHandler.onAuthenticationSuccess(request, response, token)
        );
    }
}