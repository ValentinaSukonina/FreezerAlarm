package com.example.backend.service;

import com.example.backend.config.GmailConfig;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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
    public GmailApiEmailService(GmailConfig gmailProps) {
        this.gmailProps = gmailProps;
    }

    private static final Logger logger = LoggerFactory.getLogger(GmailApiEmailService.class);

    @Override
    public void sendEmail(String to, String subject, String bodyText)
            throws MessagingException, IOException, GeneralSecurityException {
        validateEmailAddresses(to);

        GoogleCredential credential = buildCredential();

        credential.refreshToken();

        Gmail service = buildGmailService(credential);

        MimeMessage email = createEmail(to, gmailProps.getEmailFrom(), subject, bodyText);
        Message message = createMessageWithEmail(email);
        service.users().messages().send("me", message).execute();
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

    protected GoogleCredential buildCredential()
            throws GeneralSecurityException, IOException {
        return new GoogleCredential.Builder()
                .setClientSecrets(gmailProps.getClientId(), gmailProps.getClientSecret())
                .setTransport(GoogleNetHttpTransport.newTrustedTransport())
                .setJsonFactory(GsonFactory.getDefaultInstance())
                .build()
                .setRefreshToken(gmailProps.getRefreshToken());
    }

    protected Gmail buildGmailService(GoogleCredential credential)
            throws GeneralSecurityException, IOException {
        return new Gmail.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                credential
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