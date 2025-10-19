package com.example.demo.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "partner_links", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_partner", columnNames = {"user_id", "partner_admin_id"})
})
public class PartnerLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_admin_id", nullable = false)
    private User partnerAdmin;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public PartnerLink() {}

    public PartnerLink(User user, User partnerAdmin) {
        this.user = user;
        this.partnerAdmin = partnerAdmin;
        this.createdAt = Instant.now();
    }

    // Convenience constructor to satisfy existing controller usage
    public PartnerLink(Long userId, Long partnerAdminId) {
        this.user = new User();
        this.user.setId(userId);
        this.partnerAdmin = new User();
        this.partnerAdmin.setId(partnerAdminId);
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public User getPartnerAdmin() { return partnerAdmin; }
    public void setPartnerAdmin(User partnerAdmin) { this.partnerAdmin = partnerAdmin; }

    public Long getUserId() { return user != null ? user.getId() : null; }
    public Long getPartnerAdminId() { return partnerAdmin != null ? partnerAdmin.getId() : null; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
