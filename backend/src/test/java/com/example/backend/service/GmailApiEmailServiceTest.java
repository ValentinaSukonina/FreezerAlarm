package com.example.backend.service;

import com.example.backend.config.GmailConfig;
import com.google.api.services.gmail.Gmail;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@SpringJUnitConfig
@AutoConfigureMockMvc(addFilters = false)  // Disable Spring Security
public class GmailApiEmailServiceTest {
    @SuppressWarnings("removal")
    @MockBean
    private Gmail gmailService;  // Use @MockBean to mock Gmail service and inject it into the Spring context

    @Mock
    private GmailConfig gmailConfig;

    @InjectMocks
    private GmailApiEmailService gmailApiEmailService;

   /* @Test
    @DisplayName("Test sending valid email")
    public void testSendEmail_Valid() throws Exception {
        // Arrange
        String to = "test@example.com";
        String subject = "Test Subject";
        String bodyText = "This is a test email.";
        String from = "sender@example.com";

        // Mock Gmail API service to return a mocked Message
        Gmail.Users.Messages.Send sendMock = mock(Gmail.Users.Messages.Send.class);
        when(gmailService.users().messages().send(eq("me"), any(Message.class))).thenReturn(sendMock);
        when(sendMock.execute()).thenReturn(new Message()); // return an empty message or a mocked message

        // Mock GmailConfig to return test credentials
        when(gmailConfig.getClientId()).thenReturn("test-client-id");
        when(gmailConfig.getClientSecret()).thenReturn("test-client-secret");
        when(gmailConfig.getRefreshToken()).thenReturn("test-refresh-token");
        when(gmailConfig.getEmailFrom()).thenReturn(from);

        // Act
        gmailApiEmailService.sendEmail(to, subject, bodyText);

        // Assert
        verify(gmailService.users().messages().send(eq("me"), any(Message.class)), times(1)); // Verify Gmail API was called
    }*/

    @Test
    @DisplayName("Test invalid email address")
    public void testSendEmail_InvalidEmail() throws Exception {
        // Arrange
        String to = "invalid-email";
        String subject = "Test Subject";
        String bodyText = "This is a test email.";

        // Mock GmailConfig
        when(gmailConfig.getClientId()).thenReturn("test-client-id");
        when(gmailConfig.getClientSecret()).thenReturn("test-client-secret");
        when(gmailConfig.getRefreshToken()).thenReturn("test-refresh-token");

        // Act & Assert
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            gmailApiEmailService.sendEmail(to, subject, bodyText);
        });
        assert(exception.getMessage().contains("Invalid email address"));
    }

   /* @Test
    @DisplayName("Test Gmail API failure during sending email")
    public void testSendEmail_GmailApiFailure() throws Exception {
        // Arrange
        String to = "test@example.com";
        String subject = "Test Subject";
        String bodyText = "This is a test email.";

        // Simulate Gmail API failure (e.g. authentication failure)
        when(gmailService.users().messages().send(anyString(), any(Message.class)))
                .thenThrow(new MessagingException("Failed to send email"));

        // Mock GmailConfig
        when(gmailConfig.getClientId()).thenReturn("test-client-id");
        when(gmailConfig.getClientSecret()).thenReturn("test-client-secret");
        when(gmailConfig.getRefreshToken()).thenReturn("test-refresh-token");

        // Act & Assert
        MessagingException exception = assertThrows(MessagingException.class, () -> {
            gmailApiEmailService.sendEmail(to, subject, bodyText);
        });
        assert(exception.getMessage().contains("Failed to send email"));
    }*/
}





