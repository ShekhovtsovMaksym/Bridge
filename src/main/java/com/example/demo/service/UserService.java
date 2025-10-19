package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PermissionService permissionService;

    @Value("${app.super-admin.secret:}")
    private String superAdminSecret;

    public void registerUser(String username, String email, String password, String phone, String role, String superAdminCode) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        // Validate phone format
        if (!phone.matches("^\\+?\\d{7,15}$")) {
            throw new RuntimeException("Invalid phone format. Use international format with 7-15 digits.");
        }

        // Normalize and validate role
        String normalizedRole = (role == null || role.isBlank()) ? "USER" : role.trim().toUpperCase();
        if (!normalizedRole.equals("USER") && !normalizedRole.equals("SUPER_ADMIN")) {
            throw new RuntimeException("Invalid role. Allowed values: USER, SUPER_ADMIN.");
        }
        if (normalizedRole.equals("SUPER_ADMIN")) {
            if (superAdminSecret == null || superAdminSecret.isBlank()) {
                throw new RuntimeException("Super admin registration is disabled: secret not configured");
            }
            if (superAdminCode == null || superAdminCode.isBlank()) {
                throw new RuntimeException("Super admin secret code is required");
            }
            if (!superAdminSecret.equals(superAdminCode)) {
                throw new RuntimeException("Invalid super admin secret code");
            }
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhone(phone);
        user.setCustomerCode(generateCustomerCode());
        user.setIndexCode(generateIndexCode());
        user.setAllowedToRequestPartner(false); // Default to false, can be set to true via admin referral
        user.setPartnerStatus("NONE");
        user.setRoleName(normalizedRole);

        userRepository.save(user);
    }

    private String generateCustomerCode() {
        return "CUST-" + System.currentTimeMillis();
    }

    private String generateIndexCode() {
        // Generate a random 4-6 digit code
        int length = 4 + (int) (Math.random() * 3); // Random length between 4 and 6
        int code = (int) (Math.random() * Math.pow(10, length));
        return String.format("%0" + length + "d", code);
    }

    public String authenticateUser(String username, String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            // Load role and permissions for JWT claims
            User user = userRepository.findByUsername(username).orElseThrow();
            String roleName = user.getRoleName() == null ? "USER" : user.getRoleName();
            List<String> permissions = permissionService.getActivePermissionCodesForRole(roleName);
            return jwtUtil.generateToken(username, roleName, permissions);
        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid username or password");
        }
    }
}
