package com.example.demo.config;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.security.SecureRandom;
import java.util.Map;

@Configuration
public class DevTestUsersSeeder {

    @Bean
    public CommandLineRunner seedDevUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Map of username -> role
            Map<String, String> users = Map.of(
                    "adm1", "SUPER_ADMIN",
                    "adm2", "SUPER_ADMIN",
                    "usr1", "USER",
                    "usr2", "USER"
            );

            int phoneCounter = 1;
            for (Map.Entry<String, String> e : users.entrySet()) {
                String username = e.getKey();
                String role = e.getValue();

                if (userRepository.existsByUsername(username)) {
                    continue; // idempotent: do not recreate
                }

                User u = new User();
                u.setUsername(username);
                u.setEmail(username + "@dev.local");
                u.setPassword(passwordEncoder.encode("123"));
                u.setPhone(String.format("+790000000%02d", phoneCounter));
                phoneCounter++;

                // Deterministic customer code, still unique
                u.setCustomerCode("CUST-" + username.toUpperCase());
                // 4-6 digit index code
                u.setIndexCode(generateIndexCode());
                u.setAllowedToRequestPartner(false);
                u.setPartnerStatus("NONE");
                u.setRoleName(role);
                // Ensure required non-null test fields
                u.setFullName("Test " + username);
                u.setDefaultAddressId(1L);

                // Save only if email not taken (to keep idempotency with unique email)
                if (!userRepository.existsByEmail(u.getEmail())) {
                    userRepository.save(u);
                }
            }
        };
    }

    private static String generateIndexCode() {
        SecureRandom rnd = new SecureRandom();
        int length = 4 + rnd.nextInt(3); // 4..6
        int bound = (int) Math.pow(10, length);
        int code = rnd.nextInt(bound);
        return String.format("%0" + length + "d", code);
    }
}
