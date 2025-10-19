package com.example.demo.controller;

import com.example.demo.dto.MessageResponse;
import com.example.demo.model.PartnerRequest;
import com.example.demo.model.User;
import com.example.demo.repository.PartnerRequestRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/partner")
@CrossOrigin(origins = "*")
public class PartnerController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PartnerRequestRepository partnerRequestRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/request")
    public ResponseEntity<?> createPartnerRequest(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("User not found"));
            }
            
            User user = userOpt.get();
            
            // Check if user is allowed to request partner status
            if (!user.getAllowedToRequestPartner()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("You are not allowed to request partner status. This feature is only available to users with admin referral."));
            }
            
            // Check if user already has a partner request or is already a partner
            if (!"NONE".equals(user.getPartnerStatus())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new MessageResponse("Partner request already exists with status: " + user.getPartnerStatus()));
            }
            
            // Update user's partner status to PENDING
            user.setPartnerStatus("PENDING");
            userRepository.save(user);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MessageResponse("Partner request created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
