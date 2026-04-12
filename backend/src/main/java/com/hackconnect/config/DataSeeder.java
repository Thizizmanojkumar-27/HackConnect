package com.hackconnect.config;

import com.hackconnect.model.Role;
import com.hackconnect.model.User;
import com.hackconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@hackconnect.com")) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@hackconnect.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Admin user seeded: admin@hackconnect.com / admin123");
        }
    }
}
