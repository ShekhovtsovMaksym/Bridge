package com.example.demo.dto;

public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String phone;

    // New fields for role selection
    private String role; // USER or SUPER_ADMIN
    private String superAdminCode; // required only if role = SUPER_ADMIN

    public RegisterRequest() {
    }

    public RegisterRequest(String username, String email, String password, String phone) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.phone = phone;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getSuperAdminCode() {
        return superAdminCode;
    }

    public void setSuperAdminCode(String superAdminCode) {
        this.superAdminCode = superAdminCode;
    }
}
