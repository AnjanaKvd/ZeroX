package com.zerox.csm;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;

@SpringBootApplication(exclude = { FlywayAutoConfiguration.class })
public class CsmApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
		System.setProperty("spring.datasource.url", dotenv.get("DB_URL"));
		System.setProperty("spring.datasource.username", dotenv.get("DB_USERNAME"));
		System.setProperty("spring.datasource.password", dotenv.get("DB_PASSWORD"));
		System.setProperty("application.security.jwt.secret-key", dotenv.get("JWT_SECRET_KEY"));
		System.setProperty("application.security.jwt.expiration", dotenv.get("JWT_EXPIRATION"));
		System.setProperty("server.port", dotenv.get("SERVER_PORT"));

		SpringApplication.run(CsmApplication.class, args);
	}
}
