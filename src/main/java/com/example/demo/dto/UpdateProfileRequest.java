package com.example.demo.dto;

public class UpdateProfileRequest {
    private String phone;
    private String password;
    private String fullName;
    private Long defaultAddressId;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String phone, String password, String fullName, Long defaultAddressId) {
        this.phone = phone;
        this.password = password;
        this.fullName = fullName;
        this.defaultAddressId = defaultAddressId;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
}
