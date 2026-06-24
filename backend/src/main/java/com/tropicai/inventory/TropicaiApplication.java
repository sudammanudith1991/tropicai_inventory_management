package com.tropicai.inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TropicaiApplication {
    public static void main(String[] args) {
        SpringApplication.run(TropicaiApplication.class, args);
    }
}
