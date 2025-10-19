package com.example.demo.repository;

import com.example.demo.model.PartnerLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartnerLinkRepository extends JpaRepository<PartnerLink, Long> {
    boolean existsByUser_IdAndPartnerAdmin_Id(Long userId, Long partnerAdminId);
    List<PartnerLink> findAllByUser_Id(Long userId);
    Optional<PartnerLink> findByUser_IdAndPartnerAdmin_Id(Long userId, Long partnerAdminId);

    // Methods used by existing controller naming
    @Query("select pl from PartnerLink pl where pl.user.id = :userId")
    List<PartnerLink> findByUserId(@Param("userId") Long userId);

    @Query("select (count(pl) > 0) from PartnerLink pl where pl.user.id = :userId and pl.partnerAdmin.id = :partnerAdminId")
    boolean existsByUserIdAndPartnerAdminId(@Param("userId") Long userId, @Param("partnerAdminId") Long partnerAdminId);

    @Query("select pl from PartnerLink pl where pl.user.id = :userId and pl.partnerAdmin.id = :partnerAdminId")
    Optional<PartnerLink> findByUserIdAndPartnerAdminId(@Param("userId") Long userId, @Param("partnerAdminId") Long partnerAdminId);
}
