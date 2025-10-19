package com.example.demo.service;

import com.example.demo.model.Permission;
import com.example.demo.model.RolePermission;
import com.example.demo.repository.PermissionRepository;
import com.example.demo.repository.RolePermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PermissionService {

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    public List<String> getActivePermissionCodesForRole(String roleName) {
        List<RolePermission> links = rolePermissionRepository.findByRoleName(roleName);
        Set<String> codes = links.stream()
                .map(RolePermission::getPermissionCode)
                .collect(Collectors.toSet());
        if (codes.isEmpty()) {
            return List.of();
        }
        List<Permission> perms = permissionRepository.findAllById(codes);
        return perms.stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .map(Permission::getCode)
                .sorted()
                .collect(Collectors.toList());
    }
}
