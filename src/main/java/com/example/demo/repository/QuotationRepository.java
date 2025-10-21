package com.example.demo.repository;

import com.example.demo.model.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    Optional<Quotation> findByShipmentRequest_Id(Long shipmentRequestId);
}
