package com.vhu.backend.service.impl;

import com.vhu.backend.dto.request.RoleRequest;
import com.vhu.backend.dto.response.RoleResponse;
import com.vhu.backend.entity.Role;
import com.vhu.backend.exception.ResourceNotFoundException;
import com.vhu.backend.repository.RoleRepository;
import com.vhu.backend.service.RoleService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.vhu.backend.entity.User;
import com.vhu.backend.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.Set;

@Service
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;

    public RoleServiceImpl(RoleRepository roleRepository, ModelMapper modelMapper, UserRepository userRepository) {
        this.modelMapper = modelMapper;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public RoleResponse createRole(RoleRequest roleRequest) {
        if(roleRepository.findByName(roleRequest.getName()).isPresent()){
            throw new IllegalArgumentException("Quyền đã tồn tại");
        };

        Role role = modelMapper.map(roleRequest, Role.class);
        Role savedRole = roleRepository.save(role);

        Set<User> adminUsers = userRepository.findUsersByRoleNames(Set.of("ROLE_ADMIN"));

        // 2. Thêm quyền mới cho từng Admin
        for (User admin : adminUsers) {
            admin.getRoles().add(savedRole);
            userRepository.save(admin);
        }

        return modelMapper.map(savedRole, RoleResponse.class);
    }

    @Override
    public List<RoleResponse> getAllRoles() {
        List<RoleResponse> roles = roleRepository.findAll().stream()
                .map(role -> modelMapper.map(role, RoleResponse.class))
                .collect(Collectors.toList());
        return roles;
    }

    @Override
    public void deleteRole(Integer roleId) {
        if(!roleRepository.existsById(roleId)){
            throw new ResourceNotFoundException("Role", "id", roleId);
        }

        if(!roleRepository.existsById(roleId)){
            throw new ResourceNotFoundException("Role", "id", roleId);
        }

        Role roleToDelete = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        if (roleToDelete.getName().equals("ROLE_MANAGER")) {
            throw new IllegalArgumentException("Không thể xóa quyền MANAGER cơ bản.");
        }

        Set<User> usersWithRole = userRepository.findUsersByRoleNames(Set.of(roleToDelete.getName()));

        Role roleView = roleRepository.findByName("ROLE_VIEW")
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "ROLE_VIEW"));

        for (User user : usersWithRole) {
            user.getRoles().remove(roleToDelete);

            if (user.getRoles().isEmpty()) {
                user.getRoles().add(roleView);
            }

            userRepository.save(user);
        }

        roleRepository.deleteById(roleId);
    }
}
