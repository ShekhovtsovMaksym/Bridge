package com.example.demo.controller;

import com.example.demo.dto.MessageResponse;
import com.example.demo.model.PartnerLink;
import com.example.demo.model.ShipmentRequest;
import com.example.demo.model.User;
import com.example.demo.repository.PartnerLinkRepository;
import com.example.demo.repository.ShipmentRequestRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/partners")
@CrossOrigin(origins = "*")
public class AdminPartnersController {

    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;
    @Autowired private PartnerLinkRepository partnerLinkRepository;
    @Autowired private ShipmentRequestRepository shipmentRequestRepository;

    private Optional<User> getCurrentUser(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);
        return userRepository.findByUsername(username);
    }

    private boolean isSuperAdmin(User u) {
        return u != null && "SUPER_ADMIN".equalsIgnoreCase(u.getRoleName());
    }

    // 1) List of clients for current SUPER_ADMIN
    @GetMapping
    public ResponseEntity<?> listClients(@RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> meOpt = getCurrentUser(authHeader);
            if (meOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Пользователь не найден"));
            User admin = meOpt.get();
            if (!isSuperAdmin(admin)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Доступ запрещён"));

            // All users that linked this admin
            List<PartnerLink> links = partnerLinkRepository.findAll().stream()
                    .filter(pl -> pl.getPartnerAdmin() != null && Objects.equals(pl.getPartnerAdmin().getId(), admin.getId()))
                    .collect(Collectors.toList());

            if (links.isEmpty()) return ResponseEntity.ok(Collections.emptyList());

            List<Long> userIds = links.stream().map(pl -> pl.getUser().getId()).collect(Collectors.toList());
            Map<Long, User> usersById = userRepository.findAllById(userIds).stream().collect(Collectors.toMap(User::getId, u -> u));

            // Build items with unreadCount and last request date
            List<Map<String, Object>> items = new ArrayList<>();
            for (Long userId : userIds) {
                User customer = usersById.get(userId);
                if (customer == null) continue;
                long unread = shipmentRequestRepository.countByUser_IdAndPartnerAdmin_IdAndStatusAndAdminSeenFalse(userId, admin.getId(), "PENDING_QUOTATION");
                Instant lastDate = shipmentRequestRepository.findMaxCreatedAt(userId, admin.getId());
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("userId", userId);
                m.put("customerCode", customer.getCustomerCode());
                m.put("fullName", customer.getFullName());
                m.put("email", customer.getEmail());
                m.put("unreadCount", unread);
                m.put("lastDate", lastDate != null ? lastDate.toString() : null); // for sorting only
                items.add(m);
            }

            // Sorting: unreadCount desc (>0 first), then by lastDate desc, then by customerCode asc
            items.sort((a, b) -> {
                long ua = ((Number)a.get("unreadCount")).longValue();
                long ub = ((Number)b.get("unreadCount")).longValue();
                if (ua == 0 && ub > 0) return 1;
                if (ub == 0 && ua > 0) return -1;
                int unreadCmp = Long.compare(ub, ua);
                if (unreadCmp != 0) return unreadCmp;
                String la = (String) a.get("lastDate");
                String lb = (String) b.get("lastDate");
                if (la != null || lb != null) {
                    if (la == null) return 1;
                    if (lb == null) return -1;
                    int dateCmp = lb.compareTo(la); // desc
                    if (dateCmp != 0) return dateCmp;
                }
                String ca = Objects.toString(a.get("customerCode"), "");
                String cb = Objects.toString(b.get("customerCode"), "");
                return ca.compareToIgnoreCase(cb);
            });

            // Remove lastDate from response
            for (Map<String, Object> m : items) m.remove("lastDate");

            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Ошибка: " + e.getMessage()));
        }
    }

    // 2) Requests of a specific client
    @GetMapping("/{userId}/requests")
    @Transactional
    public ResponseEntity<?> clientRequests(@RequestHeader("Authorization") String authHeader,
                                            @PathVariable("userId") Long userId,
                                            @RequestParam(value = "markSeen", required = false, defaultValue = "true") boolean markSeen) {
        try {
            Optional<User> meOpt = getCurrentUser(authHeader);
            if (meOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Пользователь не найден"));
            User admin = meOpt.get();
            if (!isSuperAdmin(admin)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Доступ запрещён"));

            // Check partner link exists
            if (partnerLinkRepository.findByUserIdAndPartnerAdminId(userId, admin.getId()).isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Связь с клиентом отсутствует"));
            }

            if (markSeen) {
                shipmentRequestRepository.markPendingAsSeen(userId, admin.getId());
            }

            List<ShipmentRequest> list = shipmentRequestRepository.findByUser_IdAndPartnerAdmin_IdOrderByCreatedAtDesc(userId, admin.getId());
            List<Map<String, Object>> out = list.stream().map(sr -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("requestId", sr.getId());
                // code: emulate simple string ID like SR-<id>
                m.put("code", "SR-" + sr.getId());
                m.put("status", sr.getStatus());
                m.put("adminSeen", sr.isAdminSeen());
                m.put("createdAt", sr.getCreatedAt());
                return m;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(out);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Ошибка: " + e.getMessage()));
        }
    }
}
