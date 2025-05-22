package com.example.backend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class EncryptionUtil {

    private final SecretKeySpec keySpec;

    public EncryptionUtil(@Value("${data.encryption.key:}") String key) {
        System.out.println("🔐 Resolved encryption key: '" + key + "' (length=" + (key != null ? key.length() : "null") + ")");

        if (key == null || key.length() != 16) {
            throw new IllegalArgumentException("❌ AES key must be 16 characters. Got: '" + key + "' (length=" + (key != null ? key.length() : "null") + ")");

        }

        this.keySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "AES");
    }

    public String encrypt(String input) throws Exception {
        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec);
        byte[] encrypted = cipher.doFinal(input.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(encrypted);
    }

    public String decrypt(String encrypted) throws Exception {
        Cipher cipher = Cipher.getInstance("AES");
        cipher.init(Cipher.DECRYPT_MODE, keySpec);
        byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encrypted));
        return new String(decrypted, StandardCharsets.UTF_8);
    }

    public static void main(String[] args) {
        try {
            String key = "MySecretKey12345"; // Must be 16 chars
            EncryptionUtil util = new EncryptionUtil(key);

            String email = "valentina.sukonina@medgen.gu.se";
            String phone = "+46707499133";

            String encryptedEmail = util.encrypt(email);
            String encryptedPhone = util.encrypt(phone);

            System.out.println("📧 Encrypted Email: " + encryptedEmail);
            System.out.println("📞 Encrypted Phone: " + encryptedPhone);

            // Optional: decrypt to verify
            System.out.println("📧 Decrypted Email: " + util.decrypt(encryptedEmail));
            System.out.println("📞 Decrypted Phone: " + util.decrypt(encryptedPhone));

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}