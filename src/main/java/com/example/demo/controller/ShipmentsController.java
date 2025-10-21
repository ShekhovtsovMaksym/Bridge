package com.example.demo.controller;

import com.example.demo.dto.MessageResponse;
import com.example.demo.dto.ShipmentRequestDtos.CreateRequest;
import com.example.demo.model.PartnerLink;
import com.example.demo.model.ShipmentRequest;
import com.example.demo.model.User;
import com.example.demo.repository.PartnerLinkRepository;
import com.example.demo.repository.ShipmentRequestRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.QuotationRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ShipmentsController {

    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;
    @Autowired private PartnerLinkRepository partnerLinkRepository;
    @Autowired private ShipmentRequestRepository shipmentRequestRepository;
    @Autowired private QuotationRepository quotationRepository;

    private Optional<User> getCurrentUser(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);
        return userRepository.findByUsername(username);
    }

    @GetMapping("/packing-types")
    public ResponseEntity<?> getPackingTypes(@RequestHeader("Authorization") String authHeader) {
        if (getCurrentUser(authHeader).isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User not found"));
        }
        return ResponseEntity.ok(List.of("Carton","Bubble wrap","Wooden crate","Pallet"));
    }

    @GetMapping("/receipt-cities")
    public ResponseEntity<?> getReceiptCities(@RequestHeader("Authorization") String authHeader,
                                              @RequestParam("partnerId") Long partnerId) {
        // For MVP always ["Moscow"], but check auth
        if (getCurrentUser(authHeader).isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User not found"));
        }
        return ResponseEntity.ok(List.of("Moscow"));
    }

    @PostMapping("/shipment-requests")
    public ResponseEntity<?> createShipmentRequest(@RequestHeader("Authorization") String authHeader,
                                                   @RequestBody CreateRequest req) {
        try {
            Optional<User> meOpt = getCurrentUser(authHeader);
            if (meOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User not found"));
            User me = meOpt.get();

            // Validate partner
            if (req.getPartnerAdminId() == null) {
                return badRequest("Выберите партнёра");
            }
            Optional<User> partnerOpt = userRepository.findByIdAndRoleName(req.getPartnerAdminId(), "SUPER_ADMIN");
            if (partnerOpt.isEmpty()) {
                return badRequest("Выберите партнёра");
            }
            if (!partnerLinkRepository.existsByUserIdAndPartnerAdminId(me.getId(), req.getPartnerAdminId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new MessageResponse("Partner not linked"));
            }

            // Validate description
            String description = safeTrim(req.getDescription());
            if (description == null || description.length() < 3 || description.length() > 500) {
                return badRequest("Опишите груз (минимум 3 символа)");
            }

            // Validate numbers
            BigDecimal kg = req.getKg();
            if (kg == null || kg.compareTo(BigDecimal.ZERO) <= 0) {
                return badRequest("Укажите вес (больше 0)");
            }

            Integer boxPcs = req.getBoxPcs();
            if (boxPcs != null && boxPcs < 1) {
                return badRequest("Количество мест — целое число от 1");
            }

            BigDecimal volume = req.getVolume();
            if (volume != null && volume.compareTo(BigDecimal.ZERO) < 0) {
                return badRequest("Объём — число не меньше 0");
            }

            BigDecimal costOfGoods = req.getCostOfGoods();
            if (costOfGoods == null || costOfGoods.compareTo(BigDecimal.ZERO) <= 0) {
                return badRequest("Укажите стоимость товара (больше 0)");
            }

            ShipmentRequest sr = new ShipmentRequest();
            sr.setUser(me);
            sr.setPartnerAdmin(partnerOpt.get());
            sr.setDescription(description);
            sr.setKg(kg);
            sr.setBoxPcs(boxPcs);
            sr.setVolume(volume);
            sr.setCostOfGoods(costOfGoods);
            sr.setPackingType(safeTrim(req.getPackingType()));
            sr.setProductLocation(safeTrim(req.getProductLocation()));
            sr.setReceiptCity(safeTrim(req.getReceiptCity()));
            sr.setReceiptDetails(safeTrim(req.getReceiptDetails()));
            if (req.getAttachments() != null) {
                sr.getAttachments().addAll(req.getAttachments());
            }
            sr.setStatus("PENDING_QUOTATION");

            ShipmentRequest saved = shipmentRequestRepository.save(sr);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Minimal user endpoint to view own requests with quotation data (for UI display)
    @GetMapping("/shipment-requests")
    public ResponseEntity<?> listMyShipmentRequests(@RequestHeader("Authorization") String authHeader) {
        try {
            Optional<User> meOpt = getCurrentUser(authHeader);
            if (meOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("User not found"));
            User me = meOpt.get();
            List<ShipmentRequest> list = shipmentRequestRepository.findAllByUser_Id(me.getId());
            // sort newest first by createdAt desc (done on UI if needed)
            return ResponseEntity.ok(list.stream().map(sr -> {
                Map<String, Object> m = new java.util.LinkedHashMap<>();
                m.put("id", sr.getId());
                m.put("code", "SR-" + sr.getId());
                m.put("partnerAdminId", sr.getPartnerAdmin().getId());
                m.put("status", sr.getStatus());
                m.put("createdAt", sr.getCreatedAt());
                m.put("description", sr.getDescription());
                m.put("kg", sr.getKg());
                m.put("boxPcs", sr.getBoxPcs());
                m.put("volume", sr.getVolume());
                m.put("costOfGoods", sr.getCostOfGoods());
                m.put("packingType", sr.getPackingType());
                m.put("productLocation", sr.getProductLocation());
                m.put("receiptCity", sr.getReceiptCity());
                m.put("receiptDetails", sr.getReceiptDetails());
                m.put("attachments", sr.getAttachments());
                // Attach quotation if present
                quotationRepository.findByShipmentRequest_Id(sr.getId()).ifPresent(q -> {
                    Map<String, Object> qd = new java.util.LinkedHashMap<>();
                    qd.put("id", q.getId());
                    qd.put("insuranceAmount", q.getInsuranceAmount());
                    qd.put("deliveryPrice", q.getDeliveryPrice());
                    qd.put("packingPrice", q.getPackingPrice());
                    qd.put("deliveryTimeOption", q.getDeliveryTimeOption());
                    qd.put("comment", q.getComment());
                    qd.put("createdAt", q.getCreatedAt());
                    m.put("quotation", qd);
                });
                return m;
            }).toList());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    private ResponseEntity<MessageResponse> badRequest(String msg) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponse(msg));
    }

    private String safeTrim(String s) {
        return s == null ? null : s.trim();
    }
}
