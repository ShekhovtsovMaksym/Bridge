package com.example.demo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "quotations")
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_request_id", nullable = false)
    private ShipmentRequest shipmentRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin; // SUPER_ADMIN who sent quotation

    @Column(name = "insurance_amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal insuranceAmount;

    @Column(name = "delivery_price", precision = 19, scale = 2, nullable = false)
    private BigDecimal deliveryPrice;

    @Column(name = "packing_price", precision = 19, scale = 2, nullable = false)
    private BigDecimal packingPrice;

    @Column(name = "delivery_time_option", length = 64, nullable = false)
    private String deliveryTimeOption;

    @Column(name = "comment", length = 1000)
    private String comment;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ShipmentRequest getShipmentRequest() { return shipmentRequest; }
    public void setShipmentRequest(ShipmentRequest shipmentRequest) { this.shipmentRequest = shipmentRequest; }

    public User getAdmin() { return admin; }
    public void setAdmin(User admin) { this.admin = admin; }

    public BigDecimal getInsuranceAmount() { return insuranceAmount; }
    public void setInsuranceAmount(BigDecimal insuranceAmount) { this.insuranceAmount = insuranceAmount; }

    public BigDecimal getDeliveryPrice() { return deliveryPrice; }
    public void setDeliveryPrice(BigDecimal deliveryPrice) { this.deliveryPrice = deliveryPrice; }

    public BigDecimal getPackingPrice() { return packingPrice; }
    public void setPackingPrice(BigDecimal packingPrice) { this.packingPrice = packingPrice; }

    public String getDeliveryTimeOption() { return deliveryTimeOption; }
    public void setDeliveryTimeOption(String deliveryTimeOption) { this.deliveryTimeOption = deliveryTimeOption; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
