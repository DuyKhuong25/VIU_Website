package com.vhu.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.Set;

@Data
public class UserCreateRequest {
    @NotBlank(message = "Username không được để trống")
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    private String fullName;

    @NotEmpty(message = "Người dùng phải có ít nhất một quyền")
    private Set<String> roles;
}
