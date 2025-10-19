package com.example.demo.repository;

import com.example.demo.model.ShipmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentRequestRepository extends JpaRepository<ShipmentRequest, Long> {
    List<ShipmentRequest> findAllByUser_Id(Long userId);
}
