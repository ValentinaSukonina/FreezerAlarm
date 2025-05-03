package com.example.backend.service;

import com.example.backend.config.GmailConfig;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import com.google.auth.oauth2.UserCredentials;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.api.client.http.HttpRequestInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Base64;
import java.util.Properties;

@Service
public class GmailApiEmailService implements EmailService {
    private final GmailConfig gmailProps;

    @Autowired
    public GmailApiEmailService(@Qualifier("gmailConfig") GmailConfig gmailProps) {
        this.gmailProps = gmailProps;
    }

    private static final Logger logger = LoggerFactory.getLogger(GmailApiEmailService.class);

    @Override
    public void sendEmail(String to, String subject, String bodyText)
            throws MessagingException, IOException, GeneralSecurityException {
        validateEmailAddresses(to);

        Gmail service;
        try {
            GoogleCredentials credential = buildCredentials();
            service = buildGmailService(credential);
        } catch (Exception ex) {
            logger.error("❌ Failed to authenticate with Google API: {}", ex.getMessage(), ex);
            throw new RuntimeException("Authentication failed. Refresh token may be invalid or expired.");
        }

        MimeMessage email = createEmail(to, gmailProps.getEmailFrom(), subject, bodyText);
        Message message = createMessageWithEmail(email);

        try {
            service.users().messages().send("me", message).execute();
        } catch (Exception e) {
            String err = e.getMessage();
            if (err != null && err.contains("invalid_grant")) {
                logger.error("❌ Refresh token is invalid or expired.");
            }
            throw e;
        }
    }

    protected void validateEmailAddresses(String to) {
        String[] emails = to.split(",");
        for (String email : emails) {
            try {
                InternetAddress internetAddress = new InternetAddress(email.trim());
                internetAddress.validate();
            } catch (Exception ex) {
                logger.error("❌ Invalid recipient email: {}", email);
                throw new IllegalArgumentException("Invalid email address: " + email.trim());
            }
        }
    }

    protected GoogleCredentials buildCredentials() {
        return UserCredentials.newBuilder()
                .setClientId(gmailProps.getClientId())
                .setClientSecret(gmailProps.getClientSecret())
                .setRefreshToken(gmailProps.getRefreshToken())
                .build()
                .createScoped("https://www.googleapis.com/auth/gmail.send");
    }

    protected Gmail buildGmailService(GoogleCredentials credentials)
            throws GeneralSecurityException, IOException {

        HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(credentials);

        return new Gmail.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                requestInitializer
        ).setApplicationName("Spring Gmail Sender").build();
    }

    protected MimeMessage createEmail(String to, String from, String subject, String bodyText)
            throws MessagingException {
        Properties props = new Properties();
        Session session = Session.getInstance(props, null);

        MimeMessage email = new MimeMessage(session);
        email.setFrom(new InternetAddress(from));
        email.setRecipients(javax.mail.Message.RecipientType.TO, InternetAddress.parse(to, true));
        email.setSubject(subject);
        email.setText(bodyText, StandardCharsets.UTF_8.name());

        return email;
    }

    protected Message createMessageWithEmail(MimeMessage email)
            throws IOException, MessagingException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        email.writeTo(buffer);
        byte[] rawMessageBytes = buffer.toByteArray();
        String encodedEmail = Base64.getUrlEncoder().encodeToString(rawMessageBytes);

        Message message = new Message();
        message.setRaw(encodedEmail);
        return message;
    }
}