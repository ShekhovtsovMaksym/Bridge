package com.example.demo.config;

import com.example.demo.model.Permission;
import com.example.demo.model.Role;
import com.example.demo.model.RolePermission;
import com.example.demo.repository.PermissionRepository;
import com.example.demo.repository.RolePermissionRepository;
import com.example.demo.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner seedRolesAndPermissions(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            RolePermissionRepository rolePermissionRepository
    ) {
        return args -> {
            // Seed roles
            if (!roleRepository.existsById("SUPER_ADMIN")) {
                roleRepository.save(new Role("SUPER_ADMIN", "Super administrator with full access"));
            }
            if (!roleRepository.existsById("USER")) {
                roleRepository.save(new Role("USER", "Regular user with limited access"));
            }

            // Seed permissions
            List<Permission> initialPerms = Arrays.asList(
                    new Permission("MANAGE_USERS", "Manage Users", "Create, update, delete users"),
                    new Permission("MANAGE_ROLES", "Manage Roles", "Create, update, delete roles"),
                    new Permission("VIEW_SHIPMENTS", "View Shipments", "View shipment information"),
                    new Permission("EDIT_SHIPMENTS", "Edit Shipments", "Create or modify shipment records"),
                    new Permission("WAREHOUSE_CHECKIN", "Warehouse Check-in", "Register packages arriving at warehouse"),
                    new Permission("WAREHOUSE_RELEASE", "Warehouse Release", "Release packages from warehouse"),
                    new Permission("ANSWER_TICKETS", "Answer Tickets", "Respond to user support tickets"),
                    new Permission("CONFIGURE_SYSTEM", "Configure System", "Access to system configuration")
            );

            for (Permission p : initialPerms) {
                permissionRepository.findById(p.getCode()).orElseGet(() -> permissionRepository.save(p));
            }

            // SUPER_ADMIN -> all permissions
            for (Permission p : permissionRepository.findAll()) {
                String roleName = "SUPER_ADMIN";
                String code = p.getCode();
                boolean exists = rolePermissionRepository.findByRoleName(roleName).stream()
                        .anyMatch(rp -> rp.getPermissionCode().equals(code));
                if (!exists) {
                    rolePermissionRepository.save(new RolePermission(roleName, code));
                }
            }
            // USER -> none (implicit)
        };
    }
}
