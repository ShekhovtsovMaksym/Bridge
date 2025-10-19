package com.example.demo.dto;

import java.util.List;

public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String customerCode;
    private String indexCode;
    private String partnerStatus;
    private String fullName;
    private Long defaultAddressId;
    private Boolean allowedToRequestPartner;

    // New fields for RBAC visibility
    private String role;
    private List<String> permissions;

    public UserProfileResponse() {
    }

    public UserProfileResponse(String email, String phone, String customerCode, String indexCode, String partnerStatus, String fullName, Long defaultAddressId, Boolean allowedToRequestPartner) {
        this.email = email;
        this.phone = phone;
        this.customerCode = customerCode;
        this.indexCode = indexCode;
        this.partnerStatus = partnerStatus;
        this.fullName = fullName;
        this.defaultAddressId = defaultAddressId;
        this.allowedToRequestPartner = allowedToRequestPartner;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCustomerCode() {
        return customerCode;
    }

    public void setCustomerCode(String customerCode) {
        this.customerCode = customerCode;
    }

    public String getIndexCode() {
        return indexCode;
    }

    public void setIndexCode(String indexCode) {
        this.indexCode = indexCode;
    }

    public String getPartnerStatus() {
        return partnerStatus;
    }

    public void setPartnerStatus(String partnerStatus) {
        this.partnerStatus = partnerStatus;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Long getDefaultAddressId() {
        return defaultAddressId;
    }

    public void setDefaultAddressId(Long defaultAddressId) {
        this.defaultAddressId = defaultAddressId;
    }

    public Boolean getAllowedToRequestPartner() {
        return allowedToRequestPartner;
    }

    public void setAllowedToRequestPartner(Boolean allowedToRequestPartner) {
        this.allowedToRequestPartner = allowedToRequestPartner;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<String> permissions) {
        this.permissions = permissions;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
