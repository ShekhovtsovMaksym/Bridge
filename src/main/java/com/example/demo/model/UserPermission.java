package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_permissions")
public class UserPermission {

    public enum GrantType { ALLOW, DENY }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "permission_code", length = 64, nullable = false)
    private String permissionCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "grant_type", length = 8, nullable = false)
    private GrantType grantType;

    public UserPermission() {}

    public UserPermission(Long userId, String permissionCode, GrantType grantType) {
        this.userId = userId;
        this.permissionCode = permissionCode;
        this.grantType = grantType;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPermissionCode() {
        return permissionCode;
    }

    public void setPermissionCode(String permissionCode) {
        this.permissionCode = permissionCode;
    }

    public GrantType getGrantType() {
        return grantType;
    }

    public void setGrantType(GrantType grantType) {
        this.grantType = grantType;
    }
}
