package com.vhu.backend.service;

import com.vhu.backend.dto.request.UserCreateRequest;
import com.vhu.backend.dto.request.UserPasswordChangeRequest;
import com.vhu.backend.dto.request.UserUpdateRequest;
import com.vhu.backend.dto.response.UserResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface UserService {
    UserResponse createUser(UserCreateRequest request);
    UserResponse updateUserProfile(Long userId, UserUpdateRequest request);
    void changePassword(Long userId, UserPasswordChangeRequest request);
    UserResponse getUserById(Long userId);
    Page<UserResponse> getAllUsers(int page, int size, String search);
    void deleteUser(Long userId);
}