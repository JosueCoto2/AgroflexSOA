package com.agroflex.qr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AgroflexQrServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgroflexQrServiceApplication.class, args);
    }
}
