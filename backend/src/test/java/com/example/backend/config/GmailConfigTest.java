package com.example.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

import static org.assertj.core.api.Assertions.assertThat;

class GmailConfigTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(TestConfig.class);

    @Test
    void propertiesAreLoadedCorrectly() {
        contextRunner
                .withPropertyValues(
                        "spring.gmail.client-id=test-client-id",
                        "spring.gmail.client-secret=test-client-secret",
                        "spring.gmail.refresh-token=test-refresh-token",
                        "spring.gmail.email-from=test@example.com"
                )
                .run(context -> {
                    GmailConfig config = context.getBean(GmailConfig.class);
                    assertThat(config.getClientId()).isEqualTo("test-client-id");
                });
    }

    @Test
    void contextFailsIfRequiredPropertyIsMissing() {
        contextRunner
                .withPropertyValues(
                        "spring.gmail.client-id=test-client-id",
                        "spring.gmail.client-secret=",  // Invalid blank
                        "spring.gmail.refresh-token=test-refresh-token",
                        "spring.gmail.email-from=test@example.com"
                )
                .run(context -> {
                    assertThat(context).hasFailed(); // Context fails due to @NotBlank
                });
    }

    @EnableConfigurationProperties(GmailConfig.class)
    @Configuration
    static class TestConfig {
    }
}