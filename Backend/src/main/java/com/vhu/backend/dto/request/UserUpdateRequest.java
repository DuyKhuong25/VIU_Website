package com.vhu.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.Set;

@Data
public class UserUpdateRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Tên đầy đủ không được để trống")
    private String fullName;

    @NotEmpty(message = "Người dùng phải có ít nhất một quyền")
    private Set<String> roles;
}
