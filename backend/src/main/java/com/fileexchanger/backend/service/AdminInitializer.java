package com.fileexchanger.backend.service;

import com.fileexchanger.backend.model.User;
import com.fileexchanger.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Optional<User> adminOpt = userRepository.findByUsername("admin");
        if (adminOpt.isPresent()) {
            User admin = adminOpt.get();
            admin.setPasswordHash(passwordEncoder.encode("admin"));
            userRepository.save(admin);
            logger.info("Default admin user password has been (re)initialized.");
        } else {
            logger.warn("Default admin user not found. Consider creating it via migrations or admin UI.");
        }
    }
}

