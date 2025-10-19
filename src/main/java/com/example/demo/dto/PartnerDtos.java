package com.example.demo.dto;

import java.util.List;

public class PartnerDtos {
    public static class PartnerMiniDto {
        private Long id;
        private String username;
        private String email;
        private String phone;
        private String fullName;
        private String customerCode;

        public PartnerMiniDto() {}
        public PartnerMiniDto(Long id, String username, String email, String phone, String fullName, String customerCode) {
            this.id = id; this.username = username; this.email = email; this.phone = phone; this.fullName = fullName; this.customerCode = customerCode;
        }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getCustomerCode() { return customerCode; }
        public void setCustomerCode(String customerCode) { this.customerCode = customerCode; }
    }

    public static class PartnerDetailsDto {
        private String headerCode; // Partner_<code>
        private PartnerMiniDto partner;
        private List<String> shippingHistory;

        public PartnerDetailsDto() {}
        public PartnerDetailsDto(String headerCode, PartnerMiniDto partner, List<String> shippingHistory) {
            this.headerCode = headerCode; this.partner = partner; this.shippingHistory = shippingHistory;
        }
        public String getHeaderCode() { return headerCode; }
        public void setHeaderCode(String headerCode) { this.headerCode = headerCode; }
        public PartnerMiniDto getPartner() { return partner; }
        public void setPartner(PartnerMiniDto partner) { this.partner = partner; }
        public List<String> getShippingHistory() { return shippingHistory; }
        public void setShippingHistory(List<String> shippingHistory) { this.shippingHistory = shippingHistory; }
    }

    public static class PartnerLinkRequest {
        private String email; // optional
        private String partnerCode; // optional (admin username)
        private String partnerKey; // alias for partnerCode per spec
        public PartnerLinkRequest() {}
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPartnerCode() { return partnerCode; }
        public void setPartnerCode(String partnerCode) { this.partnerCode = partnerCode; }
        public String getPartnerKey() { return partnerKey; }
        public void setPartnerKey(String partnerKey) { this.partnerKey = partnerKey; }
    }
}
