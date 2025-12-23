package com.doctorbooking.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@PostConstruct
	public void init() {
		// Setting default timezone to Vietnam (Asia/Ho_Chi_Minh) to fix VNPay timestamp
		// issues on Render
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
		System.out.println(
				"Application timezone set to: " + TimeZone.getDefault().getID() + " at " + new java.util.Date());
	}

}
