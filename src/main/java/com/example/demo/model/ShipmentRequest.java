package com.example.demo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shipment_requests")
public class ShipmentRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // creator USER

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_admin_id", nullable = false)
    private User partnerAdmin; // SUPER_ADMIN partner company

    @Column(nullable = false, length = 500)
    private String description;

    @Column(precision = 19, scale = 3)
    private BigDecimal kg; // > 0

    @Column(name = "box_pcs")
    private Integer boxPcs; // >= 1

    @Column(precision = 19, scale = 3)
    private BigDecimal volume; // >= 0

    @Column(name = "cost_of_goods", precision = 19, scale = 2, nullable = false)
    private BigDecimal costOfGoods; // > 0

    @Column(name = "packing_type", length = 64)
    private String packingType; // code from dictionary

    @Column(name = "product_location", length = 255)
    private String productLocation;

    @Column(name = "receipt_city", length = 128)
    private String receiptCity; // e.g., Moscow

    @Column(name = "receipt_details", length = 500)
    private String receiptDetails;

    @ElementCollection
    @CollectionTable(name = "shipment_request_attachments", joinColumns = @JoinColumn(name = "shipment_request_id"))
    @Column(name = "filename", length = 255)
    private List<String> attachments = new ArrayList<>();

    @Column(length = 64, nullable = false)
    private String status = "PENDING_QUOTATION";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public ShipmentRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public User getPartnerAdmin() { return partnerAdmin; }
    public void setPartnerAdmin(User partnerAdmin) { this.partnerAdmin = partnerAdmin; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getKg() { return kg; }
    public void setKg(BigDecimal kg) { this.kg = kg; }

    public Integer getBoxPcs() { return boxPcs; }
    public void setBoxPcs(Integer boxPcs) { this.boxPcs = boxPcs; }

    public BigDecimal getVolume() { return volume; }
    public void setVolume(BigDecimal volume) { this.volume = volume; }

    public BigDecimal getCostOfGoods() { return costOfGoods; }
    public void setCostOfGoods(BigDecimal costOfGoods) { this.costOfGoods = costOfGoods; }

    public String getPackingType() { return packingType; }
    public void setPackingType(String packingType) { this.packingType = packingType; }

    public String getProductLocation() { return productLocation; }
    public void setProductLocation(String productLocation) { this.productLocation = productLocation; }

    public String getReceiptCity() { return receiptCity; }
    public void setReceiptCity(String receiptCity) { this.receiptCity = receiptCity; }

    public String getReceiptDetails() { return receiptDetails; }
    public void setReceiptDetails(String receiptDetails) { this.receiptDetails = receiptDetails; }

    public List<String> getAttachments() { return attachments; }
    public void setAttachments(List<String> attachments) { this.attachments = attachments; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
