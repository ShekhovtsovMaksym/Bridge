package com.example.demo.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ShipmentRequestDtos {
    public static class CreateRequest {
        private Long partnerAdminId; // required
        private String description; // required 3..500
        private BigDecimal kg; // >0
        private Integer boxPcs; // >=1 (optional)
        private BigDecimal volume; // >=0 (optional)
        private BigDecimal costOfGoods; // >0
        private String packingType; // optional
        private String productLocation; // optional
        private String receiptCity; // optional
        private String receiptDetails; // optional
        private List<String> attachments = new ArrayList<>(); // filenames only

        public Long getPartnerAdminId() { return partnerAdminId; }
        public void setPartnerAdminId(Long partnerAdminId) { this.partnerAdminId = partnerAdminId; }
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
    }
}
