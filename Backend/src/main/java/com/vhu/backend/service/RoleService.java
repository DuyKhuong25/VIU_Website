package com.vhu.backend.service;

import com.vhu.backend.dto.request.RoleRequest;
import com.vhu.backend.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {
    RoleResponse createRole(RoleRequest roleRequest);
    List<RoleResponse> getAllRoles();
    void deleteRole(Integer roleId);
}
