package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "permissions")
public class Permission {

    @Id
    @Column(length = 64, nullable = false, unique = true)
    private String code; // unique identifier, e.g., MANAGE_USERS

    @Column(length = 128, nullable = false)
    private String name; // human-friendly name

    @Column(length = 1024)
    private String description; // description for admin/docs

    @Column(nullable = false)
    private Boolean isActive = true; // soft deactivation

    public Permission() {}

    public Permission(String code, String name, String description) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.isActive = true;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
