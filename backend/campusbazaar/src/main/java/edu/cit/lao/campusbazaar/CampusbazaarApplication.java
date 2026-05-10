package edu.cit.lao.campusbazaar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CampusbazaarApplication {
	public static void main(String[] args) {
		SpringApplication.run(CampusbazaarApplication.class, args);
	}
}