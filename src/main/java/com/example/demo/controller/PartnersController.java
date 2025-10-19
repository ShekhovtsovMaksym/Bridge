package com.example.demo.controller;

import com.example.demo.dto.MessageResponse;
import com.example.demo.dto.PartnerDtos.PartnerDetailsDto;
import com.example.demo.dto.PartnerDtos.PartnerLinkRequest;
import com.example.demo.dto.PartnerDtos.PartnerMiniDto;
import com.example.demo.model.PartnerLink;
import com.example.demo.model.User;
import com.example.demo.repository.PartnerLinkRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/partners")
@CrossOrigin(origins = "*")
public class PartnersController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PartnerLinkRepository partnerLinkRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private Optional<User> getCurrentUser(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);
        return userRepository.findByUsername(username);
    }

    @GetMapping
    public ResponseEntity<?> listLinkedPartners(@RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> meOpt = getCurrentUser(authHeader);
            if (meOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User not found"));
            User me = meOpt.get();
            List<PartnerLink> links = partnerLinkRepository.findByUserId(me.getId());
            if (links.isEmpty()) return ResponseEntity.ok(List.of());
            List<Long> partnerIds = links.stream().map(PartnerLink::getPartnerAdminId).collect(Collectors.toList());
            List<User> admins = userRepository.findAllById(partnerIds);
            List<PartnerMiniDto> dtos = admins.stream().map(this::toMini).collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @PostMapping("/link")
    public ResponseEntity<?> linkPartner(@RequestHeader("Authorization") String authHeader,
                                         @RequestBody PartnerLinkRequest request) {
        try {
            Optional<User> meOpt = getCurrentUser(authHeader);
            if (meOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User not found"));
            User me = meOpt.get();

            // Determine search key: email or partnerCode (maps to username)
            String email = request.getEmail() != null ? request.getEmail().trim() : null;
            String code = request.getPartnerCode() != null ? request.getPartnerCode().trim() : null;
            String key = request.getPartnerKey() != null ? request.getPartnerKey().trim() : null;
            if ((email == null || email.isEmpty()) && (code == null || code.isEmpty()) && (key == null || key.isEmpty())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse("Provide email or partnerKey/partnerCode"));
            }

            Optional<User> adminOpt = Optional.empty();
            if (email != null && !email.isEmpty()) {
                adminOpt = userRepository.findByRoleNameAndEmail("SUPER_ADMIN", email);
            } else if (code != null && !code.isEmpty()) {
                adminOpt = userRepository.findByRoleNameAndPartnerCode("SUPER_ADMIN", code);
            } else if (key != null && !key.isEmpty()) {
                adminOpt = userRepository.findByRoleNameAndPartnerCode("SUPER_ADMIN", key);
            }

            if (adminOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Partner (SUPER_ADMIN) not found"));
            }
            User admin = adminOpt.get();

            if (Objects.equals(me.getId(), admin.getId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse("Cannot add yourself as partner"));
            }

            if (partnerLinkRepository.existsByUserIdAndPartnerAdminId(me.getId(), admin.getId())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(new MessageResponse("Partner already added"));
            }

            PartnerLink link = new PartnerLink(me.getId(), admin.getId());
            partnerLinkRepository.save(link);
            return ResponseEntity.ok(new MessageResponse("Partner added"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/find")
    public ResponseEntity<?> findPartner(@RequestHeader("Authorization") String authHeader,
                                         @RequestParam(value = "email", required = false) String email,
                                         @RequestParam(value = "partnerCode", required = false) String partnerCode,
                                         @RequestParam(value = "q", required = false) String q) {
        try {
            // just ensure current user is valid
            if (getCurrentUser(authHeader).isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User not found"));
            String queryEmail = email;
            String queryCode = partnerCode;
            if ((queryEmail == null || queryEmail.isBlank()) && (queryCode == null || queryCode.isBlank()) && q != null && !q.isBlank()) {
                if (q.contains("@")) queryEmail = q; else queryCode = q;
            }
            Optional<User> adminOpt = Optional.empty();
            if (queryEmail != null && !queryEmail.isBlank()) {
                adminOpt = userRepository.findByRoleNameAndEmail("SUPER_ADMIN", queryEmail.trim());
            } else if (queryCode != null && !queryCode.isBlank()) {
                adminOpt = userRepository.findByRoleNameAndPartnerCode("SUPER_ADMIN", queryCode.trim());
            }
            if (adminOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Not found"));
            }
            return ResponseEntity.ok(toMini(adminOpt.get()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/{partnerId}")
    public ResponseEntity<?> getPartnerDetails(@RequestHeader("Authorization") String authHeader,
                                               @PathVariable("partnerId") Long partnerId) {
        try {
            Optional<User> meOpt = getCurrentUser(authHeader);
            if (meOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User not found"));
            User me = meOpt.get();

            // Ensure link exists
            if (partnerLinkRepository.findByUserIdAndPartnerAdminId(me.getId(), partnerId).isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Partner not linked"));
            }

            Optional<User> adminOpt = userRepository.findById(partnerId);
            if (adminOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Partner not found"));
            }
            User admin = adminOpt.get();
            PartnerMiniDto mini = toMini(admin);
            String numeric = extractCode(mini.getCustomerCode());
            String header = "Partner_" + (numeric != null ? numeric : String.valueOf(admin.getId()));
            List<String> history = List.of("BR20240723_1_2 (New)", "BR20240721_1_4 (Arrived)");
            PartnerDetailsDto dto = new PartnerDetailsDto(header, mini, history);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    private PartnerMiniDto toMini(User u) {
        return new PartnerMiniDto(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getPhone(),
                u.getFullName(),
                u.getCustomerCode()
        );
    }

    private String extractCode(String customerCode) {
        if (customerCode == null) return null;
        String cc = customerCode.trim();
        if (cc.startsWith("CUST-")) {
            return cc.substring(5);
        }
        return cc;
    }
}
