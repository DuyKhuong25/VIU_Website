// Công dụng: Triển khai logic đăng nhập, xác thực và tạo token.
package com.vhu.backend.service.impl;

import com.vhu.backend.dto.request.LoginRequest;
import com.vhu.backend.dto.response.JwtAuthResponse;
import com.vhu.backend.entity.User;
import com.vhu.backend.jwt.JwtTokenProvider;
import com.vhu.backend.repository.UserRepository;
import com.vhu.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Override
    public JwtAuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        ));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail()).get();
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());

        return new JwtAuthResponse(token,user.getId(),user.getUsername(), user.getEmail(), user.getFullName(), roles);
    }
}