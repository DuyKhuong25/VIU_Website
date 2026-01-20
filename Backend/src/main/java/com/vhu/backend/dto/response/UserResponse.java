package com.vhu.backend.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private LocalDateTime createdAt;
    private Set<String> roles;
}
