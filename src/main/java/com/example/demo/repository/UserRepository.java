package com.example.demo.repository;

import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByRoleNameAndEmail(String roleName, String email);
    Optional<User> findByRoleNameAndPartnerCode(String roleName, String partnerCode);
    Optional<User> findByIdAndRoleName(Long id, String roleName);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
}
