package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "role_permissions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"role_name", "permission_code"}))
public class RolePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_name", length = 64, nullable = false)
    private String roleName;

    @Column(name = "permission_code", length = 64, nullable = false)
    private String permissionCode;

    public RolePermission() {}

    public RolePermission(String roleName, String permissionCode) {
        this.roleName = roleName;
        this.permissionCode = permissionCode;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public String getPermissionCode() {
        return permissionCode;
    }

    public void setPermissionCode(String permissionCode) {
        this.permissionCode = permissionCode;
    }
}
