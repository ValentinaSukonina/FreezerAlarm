package com.example.backend.service;

import com.example.backend.config.GmailConfig;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.mail.internet.MimeMessage;

import java.io.IOException;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class GmailApiEmailServiceTest {

    private GmailConfig mockConfig;
    private Gmail mockGmail;

    private GmailApiEmailService service;

    @BeforeEach
    void setUp() throws Exception {
        // Mock GmailConfig
        mockConfig = mock(GmailConfig.class);
        when(mockConfig.getClientId()).thenReturn("client-id");
        when(mockConfig.getClientSecret()).thenReturn("client-secret");
        when(mockConfig.getRefreshToken()).thenReturn("refresh-token");
        when(mockConfig.getEmailFrom()).thenReturn("sender@example.com");

        // Gmail API mock chain
        mockGmail = mock(Gmail.class);
        Gmail.Users users = mock(Gmail.Users.class);
        Gmail.Users.Messages messages = mock(Gmail.Users.Messages.class);
        Gmail.Users.Messages.Send send = mock(Gmail.Users.Messages.Send.class);

        when(send.execute()).thenReturn(new Message());
        when(messages.send(any(), any())).thenReturn(send);
        when(users.messages()).thenReturn(messages);
        when(mockGmail.users()).thenReturn(users);

        // Mocks refreshToken() and Gmail
        service = new GmailApiEmailService(mockConfig) {

            @Override
            protected GoogleCredential buildCredential()
                    throws IOException {
                GoogleCredential credential = mock(GoogleCredential.class);
                when(credential.refreshToken()).thenReturn(true);
                return credential;
            }

            @Override
            protected Gmail buildGmailService(GoogleCredential credential) {
                return mockGmail;
            }
        };
    }

    @Test
    void testSendEmail_CallsAllRealMethodsExceptExternal() throws Exception {

        service.sendEmail("test@example.com", "Subject", "Body");

        verify(mockGmail.users().messages(), times(1)).send(eq("me"), any());
    }

    @Test
    void testCreateEmail_CreatesCorrectMimeMessage() throws Exception {
        GmailApiEmailService realService = new GmailApiEmailService(mockConfig);

        MimeMessage message = realService.createEmail(
                "test@example.com",
                "sender@example.com",
                "My Subject",
                "This is the body text."
        );

        assertNotNull(message);
        assertEquals("My Subject", message.getSubject());
        assertEquals("sender@example.com", message.getFrom()[0].toString());
        assertEquals("test@example.com", message.getAllRecipients()[0].toString());
        assertTrue(message.getContent().toString().contains("This is the body text."));
    }

    @Test
    void testCreateMessageWithEmail_EncodesCorrectly() throws Exception {
        GmailApiEmailService realService = new GmailApiEmailService(mockConfig);
        MimeMessage email = realService.createEmail(
                "to@example.com",
                "from@example.com",
                "Test Subject",
                "Hello World"
        );

        Message message = realService.createMessageWithEmail(email);

        assertNotNull(message.getRaw(), "Expected encoded message to not be null");
        assertFalse(message.getRaw().isEmpty(), "Expected encoded message to not be empty");

    }

    @Test
    void testSendEmail_WithInvalidRecipient_ThrowsException() {
        when(mockConfig.getEmailFrom()).thenReturn("sender@example.com");

        GmailApiEmailService apiService = new GmailApiEmailService(mockConfig) {
            @Override
            protected GoogleCredential buildCredential() {
                return mock(GoogleCredential.class);
            }

            @Override
            protected Gmail buildGmailService(GoogleCredential credential) {
                return mock(Gmail.class);
            }
        };

        Exception exception = assertThrows(
                IllegalArgumentException.class,
                () -> apiService.sendEmail("invalid-email", "Subject", "Body")
        );

        assertTrue(exception.getMessage().contains("Invalid email address"));
    }

    @Test
    void testValidateEmailAddresses_WithInvalidEmail_Throws() {
        Exception exception = assertThrows(IllegalArgumentException.class, () ->
                new GmailApiEmailService(mockConfig).validateEmailAddresses("not-an-email")
        );
        assertTrue(exception.getMessage().contains("Invalid email address"));
    }

    @Test
    void testValidateEmailAddresses_WithValidEmails_Passes() {
        GmailApiEmailService apiService = new GmailApiEmailService(mockConfig);
        assertDoesNotThrow(() ->
                apiService.validateEmailAddresses("test1@example.com, test2@example.com")
        );
    }

    @Test
    void testSendEmail_WithMultipleRecipients_CallsSendOnce() throws Exception {
        service.sendEmail("test1@example.com, test2@example.com", "Multi-Recipient Test", "Body");

        verify(mockGmail.users().messages(), times(1)).send(eq("me"), any());
    }

    @Test
    void testBuildCredentialAndBuildGmailService_CreatesInstancesSuccessfully() throws Exception {
        GmailApiEmailService realService = new GmailApiEmailService(mockConfig);

        // Stub just enough config to call real method
        when(mockConfig.getClientId()).thenReturn("client-id");
        when(mockConfig.getClientSecret()).thenReturn("client-secret");
        when(mockConfig.getRefreshToken()).thenReturn("dummy-refresh-token");

        // Act
        GoogleCredential credential = realService.buildCredential();
        assertNotNull(credential);

        Gmail gmail = realService.buildGmailService(credential);
        assertNotNull(gmail);
    }

}
