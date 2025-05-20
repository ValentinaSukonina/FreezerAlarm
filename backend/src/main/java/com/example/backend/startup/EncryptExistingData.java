package com.example.backend.startup;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.util.EncryptionUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("!prod")
@ConditionalOnProperty(name = "data.encryption.enabled", havingValue = "true")
public class EncryptExistingData implements CommandLineRunner {

    private final UserRepository userRepository;
    private final boolean encryptionEnabled;
    private final EncryptionUtil encryptionUtil;

    public EncryptExistingData(
            UserRepository userRepository,
            EncryptionUtil encryptionUtil,
            @Value("${data.encryption.enabled:false}") boolean encryptionEnabled
    ) {
        this.userRepository = userRepository;
        this.encryptionUtil = encryptionUtil;
        this.encryptionEnabled = encryptionEnabled;
    }

    @Override
    public void run(String... args) {
        if (!encryptionEnabled) {
            System.out.println("⚠️ Encryption is disabled.");
            return;
        }

        List<User> users = userRepository.findAll();
        int count = 0;

        for (User user : users) {
            if (isUnencryptedEmail(user.getEmail()) || isUnencryptedPhone(user.getPhoneNumber())) {
                try {
                    user.setEmail(encryptionUtil.encrypt(user.getEmail()));
                    user.setPhoneNumber(encryptionUtil.encrypt(user.getPhoneNumber()));
                    userRepository.save(user);
                    count++;
                } catch (Exception e) {
                    System.err.println("❌ Failed to encrypt user ID " + user.getId() + ": " + e.getMessage());
                }
            }
        }

        System.out.println("✅ Encrypted " + count + " user(s) with previously unencrypted data.");
    }

    private boolean isUnencryptedEmail(String email) {
        return email != null && email.contains("@");
    }

    private boolean isUnencryptedPhone(String phone) {
        return phone != null && phone.matches("[0-9+\\-() ]{5,}");
    }
}
