package com.example.backend.service;

import com.example.backend.config.GmailConfig;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Properties;

@Service
public class GmailApiEmailService implements EmailService {
    private final GmailConfig gmailProps;

    @Autowired
    public GmailApiEmailService(GmailConfig gmailProps) {
        this.gmailProps = gmailProps;
    }

    @Override
    public void sendEmail(String to, String subject, String bodyText) throws Exception {
        GoogleCredential credential = new GoogleCredential.Builder()
                .setClientSecrets(gmailProps.getClientId(), gmailProps.getClientSecret())
                .setTransport(GoogleNetHttpTransport.newTrustedTransport())
                .setJsonFactory(JacksonFactory.getDefaultInstance())
                .build()
                .setRefreshToken(gmailProps.getRefreshToken());

        credential.refreshToken();

        Gmail service = new Gmail.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JacksonFactory.getDefaultInstance(),
                credential)
                .setApplicationName("Spring Gmail Sender")
                .build();

        MimeMessage email = createEmail(to, gmailProps.getEmailFrom(), subject, bodyText);
        Message message = createMessageWithEmail(email);
        service.users().messages().send("me", message).execute();
    }

    private MimeMessage createEmail(String to, String from, String subject, String bodyText) throws Exception {
        Properties props = new Properties();
        Session session = Session.getInstance(props, null);

        MimeMessage email = new MimeMessage(session);
        email.setFrom(new InternetAddress(from));
        email.addRecipient(javax.mail.Message.RecipientType.TO, new InternetAddress(to));
        email.setSubject(subject);
        email.setText(bodyText, StandardCharsets.UTF_8.name());

        return email;
    }

    private Message createMessageWithEmail(MimeMessage email) throws Exception {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        email.writeTo(buffer);
        byte[] rawMessageBytes = buffer.toByteArray();
        String encodedEmail = Base64.getUrlEncoder().encodeToString(rawMessageBytes);

        Message message = new Message();
        message.setRaw(encodedEmail);
        return message;
    }
}