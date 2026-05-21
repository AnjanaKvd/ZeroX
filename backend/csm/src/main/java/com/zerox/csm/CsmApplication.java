package com.zerox.csm;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;

@SpringBootApplication(exclude = { FlywayAutoConfiguration.class })
public class CsmApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        setProperty("spring.datasource.url",                    dotenv, "DB_URL");
        setProperty("spring.datasource.username",               dotenv, "DB_USERNAME");
        setProperty("spring.datasource.password",               dotenv, "DB_PASSWORD");
        setProperty("application.security.jwt.secret-key",      dotenv, "JWT_SECRET_KEY");
        setProperty("application.security.jwt.expiration",      dotenv, "JWT_EXPIRATION");
        setProperty("server.port",                              dotenv, "SERVER_PORT");

        SpringApplication.run(CsmApplication.class, args);
    }

    private static void setProperty(String property, Dotenv dotenv, String envKey) {
        // Try .env file first, then fall back to real system env var (Railway)
        String value = dotenv.get(envKey, System.getenv(envKey));
        if (value != null) {
            System.setProperty(property, value);
        }
    }
}