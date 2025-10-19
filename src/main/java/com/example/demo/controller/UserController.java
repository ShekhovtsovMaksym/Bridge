package com.example.demo.controller;

import com.example.demo.dto.MessageResponse;
import com.example.demo.dto.UpdateProfileRequest;
import com.example.demo.dto.UserProfileResponse;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.PermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PermissionService permissionService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("User not found"));
            }
            
            User user = userOpt.get();
            
            UserProfileResponse response = new UserProfileResponse(
                user.getEmail(),
                user.getPhone(),
                user.getCustomerCode(),
                user.getIndexCode(),
                user.getPartnerStatus(),
                user.getFullName(),
                user.getDefaultAddressId(),
                user.getAllowedToRequestPartner()
            );
            // Set identity basics
            response.setId(user.getId());
            response.setUsername(user.getUsername());
            // Add role and permissions
            response.setRole(user.getRoleName());
            response.setPermissions(permissionService.getActivePermissionCodesForRole(user.getRoleName()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@RequestHeader("Authorization") String authHeader, 
                                               @RequestBody UpdateProfileRequest request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("User not found"));
            }
            
            User user = userOpt.get();
            
            // Validate phone format
            if (request.getPhone() != null && !request.getPhone().isEmpty()) {
                if (!request.getPhone().matches("^\\+?\\d{7,15}$")) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Invalid phone format. Use international format with 7-15 digits."));
                }
                user.setPhone(request.getPhone());
            }
            
            // Validate fullName
            if (request.getFullName() != null && !request.getFullName().isEmpty()) {
                if (request.getFullName().length() < 2 || request.getFullName().length() > 100) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Full name must be between 2 and 100 characters."));
                }
                user.setFullName(request.getFullName());
            }
            
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            
            if (request.getDefaultAddressId() != null) {
                user.setDefaultAddressId(request.getDefaultAddressId());
            }
            
            userRepository.save(user);
            
            return ResponseEntity.ok(new MessageResponse("Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
