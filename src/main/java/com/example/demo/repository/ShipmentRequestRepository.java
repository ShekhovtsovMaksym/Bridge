package com.example.demo.repository;

import com.example.demo.model.ShipmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRequestRepository extends JpaRepository<ShipmentRequest, Long> {
    List<ShipmentRequest> findAllByUser_Id(Long userId);

    List<ShipmentRequest> findByUser_IdAndPartnerAdmin_IdOrderByCreatedAtDesc(Long userId, Long partnerAdminId);

    long countByUser_IdAndPartnerAdmin_IdAndStatusAndAdminSeenFalse(Long userId, Long partnerAdminId, String status);

    Optional<ShipmentRequest> findTopByUser_IdAndPartnerAdmin_IdOrderByCreatedAtDesc(Long userId, Long partnerAdminId);

    Optional<ShipmentRequest> findByIdAndPartnerAdmin_Id(Long id, Long partnerAdminId);

    @Query("select sr.id from ShipmentRequest sr where sr.user.id = :userId and sr.partnerAdmin.id = :partnerAdminId and sr.status = 'PENDING_QUOTATION' order by sr.createdAt asc")
    List<Long> findPendingIdsByUserAndAdmin(@Param("userId") Long userId, @Param("partnerAdminId") Long partnerAdminId);

    @Modifying
    @Query("update ShipmentRequest sr set sr.adminSeen = true where sr.user.id = :userId and sr.partnerAdmin.id = :partnerAdminId and sr.status = 'PENDING_QUOTATION' and sr.adminSeen = false")
    int markPendingAsSeen(@Param("userId") Long userId, @Param("partnerAdminId") Long partnerAdminId);

    @Modifying
    @Query("update ShipmentRequest sr set sr.adminSeen = true where sr.id = :requestId and sr.status = 'PENDING_QUOTATION' and sr.adminSeen = false")
    int markSinglePendingAsSeen(@Param("requestId") Long requestId);

    @Query("select max(sr.createdAt) from ShipmentRequest sr where sr.user.id = :userId and sr.partnerAdmin.id = :partnerAdminId")
    Instant findMaxCreatedAt(@Param("userId") Long userId, @Param("partnerAdminId") Long partnerAdminId);
}
