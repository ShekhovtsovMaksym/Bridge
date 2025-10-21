package com.example.demo.controller;

import com.example.demo.dto.MessageResponse;
import com.example.demo.model.Quotation;
import com.example.demo.model.ShipmentRequest;
import com.example.demo.model.User;
import com.example.demo.repository.QuotationRepository;
import com.example.demo.repository.ShipmentRequestRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminRequestsController {

    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;
    @Autowired private ShipmentRequestRepository shipmentRequestRepository;
    @Autowired private QuotationRepository quotationRepository;

    private Optional<User> getCurrentUser(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);
        return userRepository.findByUsername(username);
    }

    private boolean isSuperAdmin(User u) {
        return u != null && "SUPER_ADMIN".equalsIgnoreCase(u.getRoleName());
    }

    // 3.3 Get full data for a specific request (only if belongs to current admin)
    @GetMapping("/requests/{requestId}")
    @Transactional
    public ResponseEntity<?> getRequest(@RequestHeader("Authorization") String authHeader,
                                        @PathVariable("requestId") Long requestId,
                                        @RequestParam(value = "markSeen", required = false, defaultValue = "true") boolean markSeen) {
        try {
            Optional<User> meOpt = getCurrentUser(authHeader);
            if (meOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Пользователь не найден"));
            User admin = meOpt.get();
            if (!isSuperAdmin(admin)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Доступ запрещён"));

            Optional<ShipmentRequest> srOpt = shipmentRequestRepository.findByIdAndPartnerAdmin_Id(requestId, admin.getId());
            if (srOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Заявка не найдена"));
            ShipmentRequest sr = srOpt.get();

            if (markSeen) {
                shipmentRequestRepository.markSinglePendingAsSeen(sr.getId());
            }

            Optional<Quotation> qOpt = quotationRepository.findByShipmentRequest_Id(sr.getId());

            Map<String, Object> resp = new LinkedHashMap<>();
            Map<String, Object> req = new LinkedHashMap<>();
            req.put("id", sr.getId());
            req.put("code", "SR-" + sr.getId());
            req.put("status", sr.getStatus());
            req.put("adminSeen", sr.isAdminSeen());
            req.put("createdAt", sr.getCreatedAt());
            req.put("description", sr.getDescription());
            req.put("kg", sr.getKg());
            req.put("boxPcs", sr.getBoxPcs());
            req.put("volume", sr.getVolume());
            req.put("costOfGoods", sr.getCostOfGoods());
            req.put("packingType", sr.getPackingType());
            req.put("productLocation", sr.getProductLocation());
            req.put("receiptCity", sr.getReceiptCity());
            req.put("receiptDetails", sr.getReceiptDetails());
            req.put("attachments", sr.getAttachments());
            // Add client header basics
            Map<String, Object> client = new LinkedHashMap<>();
            client.put("userId", sr.getUser().getId());
            client.put("fullName", sr.getUser().getFullName());
            client.put("email", sr.getUser().getEmail());
            client.put("customerCode", sr.getUser().getCustomerCode());

            resp.put("request", req);
            resp.put("client", client);

            if (qOpt.isPresent()) {
                Quotation q = qOpt.get();
                Map<String, Object> qdto = new LinkedHashMap<>();
                qdto.put("id", q.getId());
                qdto.put("insuranceAmount", q.getInsuranceAmount());
                qdto.put("deliveryPrice", q.getDeliveryPrice());
                qdto.put("packingPrice", q.getPackingPrice());
                qdto.put("deliveryTimeOption", q.getDeliveryTimeOption());
                qdto.put("comment", q.getComment());
                qdto.put("createdAt", q.getCreatedAt());
                resp.put("quotation", qdto);
            }

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Ошибка: " + e.getMessage()));
        }
    }

    public static class CreateQuotationRequest {
        public Long requestId;
        public BigDecimal insuranceAmount;
        public BigDecimal deliveryPrice;
        public BigDecimal packingPrice;
        public String deliveryTimeOption;
        public String comment;
        public Long getRequestId() { return requestId; }
        public BigDecimal getInsuranceAmount() { return insuranceAmount; }
        public BigDecimal getDeliveryPrice() { return deliveryPrice; }
        public BigDecimal getPackingPrice() { return packingPrice; }
        public String getDeliveryTimeOption() { return deliveryTimeOption; }
        public String getComment() { return comment; }
    }

    // 3.4 Create quotation
    @PostMapping("/quotations")
    @Transactional
    public ResponseEntity<?> createQuotation(@RequestHeader("Authorization") String authHeader,
                                             @RequestBody CreateQuotationRequest body) {
        try {
            Optional<User> meOpt = getCurrentUser(authHeader);
            if (meOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Пользователь не найден"));
            User admin = meOpt.get();
            if (!isSuperAdmin(admin)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Доступ запрещён"));

            if (body == null || body.requestId == null) return ResponseEntity.badRequest().body(new MessageResponse("requestId обязателен"));
            if (body.insuranceAmount == null || body.insuranceAmount.compareTo(BigDecimal.ZERO) < 0)
                return ResponseEntity.badRequest().body(new MessageResponse("Insurance amount должен быть ≥ 0"));
            if (body.deliveryPrice == null || body.deliveryPrice.compareTo(BigDecimal.ZERO) < 0)
                return ResponseEntity.badRequest().body(new MessageResponse("Delivery price должен быть ≥ 0"));
            if (body.packingPrice == null || body.packingPrice.compareTo(BigDecimal.ZERO) < 0)
                return ResponseEntity.badRequest().body(new MessageResponse("Packing price должен быть ≥ 0"));
            if (body.deliveryTimeOption == null || body.deliveryTimeOption.trim().isEmpty())
                return ResponseEntity.badRequest().body(new MessageResponse("Выберите срок доставки"));

            Optional<ShipmentRequest> srOpt = shipmentRequestRepository.findByIdAndPartnerAdmin_Id(body.requestId, admin.getId());
            if (srOpt.isEmpty()) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Нет доступа к заявке"));
            ShipmentRequest sr = srOpt.get();

            // Allow creating quotation even if already QUOTED? For now prevent duplicate.
            if ("QUOTED".equalsIgnoreCase(sr.getStatus())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(new MessageResponse("Просчёт уже отправлен"));
            }

            // Create quotation
            Quotation q = new Quotation();
            q.setShipmentRequest(sr);
            q.setAdmin(admin);
            q.setInsuranceAmount(body.insuranceAmount);
            q.setDeliveryPrice(body.deliveryPrice);
            q.setPackingPrice(body.packingPrice);
            q.setDeliveryTimeOption(body.deliveryTimeOption.trim());
            q.setComment(body.comment);

            quotationRepository.save(q);

            // Update request status
            sr.setStatus("QUOTED");
            shipmentRequestRepository.save(sr);

            Map<String, Object> out = new LinkedHashMap<>();
            out.put("id", q.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(out);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Ошибка: " + e.getMessage()));
        }
    }
}
