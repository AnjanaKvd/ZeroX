package com.zerox.csm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;

@SpringBootApplication
public class CsmApplication {

	@GetMapping("/")
	public String welcome(){
		return "Welcome Java Spring Boot!";
	}

	public static void main(String[] args) {
		SpringApplication.run(CsmApplication.class, args);
	}

}
