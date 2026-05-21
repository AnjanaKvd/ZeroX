package com.zerox.csm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;

@SpringBootApplication(exclude = { FlywayAutoConfiguration.class })
public class CsmApplication {

    public static void main(String[] args) {
        SpringApplication.run(CsmApplication.class, args);
    }
}