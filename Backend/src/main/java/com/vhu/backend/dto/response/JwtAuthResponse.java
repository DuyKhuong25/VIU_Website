package com.vhu.backend.dto.response;

import lombok.Data;
import java.util.Set;

@Data
public class JwtAuthResponse {
    private String accessToken;
    private Long id;
    private String tokenType = "Bearer";
    private String username;
    private String email;
    private String fullName;
    private Set<String> roles;

    public JwtAuthResponse(String accessToken, Long id, String username, String email, String fullName, Set<String> roles) {
        this.id = id;
        this.accessToken = accessToken;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
    }
}
