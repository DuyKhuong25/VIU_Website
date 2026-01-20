// Công dụng: Định nghĩa các phương thức cho việc xác thực.
package com.vhu.backend.service;

import com.vhu.backend.dto.request.LoginRequest;
import com.vhu.backend.dto.response.JwtAuthResponse;

public interface AuthService {
    JwtAuthResponse login(LoginRequest loginRequest);
}