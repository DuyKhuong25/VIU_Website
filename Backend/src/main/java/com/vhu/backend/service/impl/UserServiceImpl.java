package com.vhu.backend.service.impl;

import com.vhu.backend.dto.request.UserCreateRequest;
import com.vhu.backend.dto.request.UserPasswordChangeRequest;
import com.vhu.backend.dto.request.UserUpdateRequest;
import com.vhu.backend.dto.response.UserResponse;
import com.vhu.backend.entity.NotificationType;
import com.vhu.backend.entity.Role;
import com.vhu.backend.entity.User;
import com.vhu.backend.exception.ResourceNotFoundException;
import com.vhu.backend.repository.RoleRepository;
import com.vhu.backend.repository.UserRepository;
import com.vhu.backend.repository.specification.UserSpecification;
import com.vhu.backend.service.NotificationService;
import com.vhu.backend.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ROLE_MANAGER = "ROLE_MANAGER";
    private static final String ROLE_EDITOR = "ROLE_EDITOR";
    private static final String ROLE_VIEW = "ROLE_VIEW";
    private static final Set<String> SUPERIOR_ROLES = Set.of(ROLE_ADMIN, ROLE_MANAGER);
    private static final Set<String> SUBORDINATE_ROLES = Set.of(ROLE_EDITOR, ROLE_VIEW);


    public UserServiceImpl(RoleRepository roleRepository, UserRepository userRepository, ModelMapper modelMapper, PasswordEncoder passwordEncoder, NotificationService notificationService) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    private Set<String> getCallerRoles() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
    }

    private User getCallerUser() {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentEmail));
    }

    private Role getRoleView() {
        return roleRepository.findByName("ROLE_VIEW")
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "ROLE_VIEW"));
    }

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if(userRepository.findByUsername(request.getUsername()).isPresent()){
            throw new IllegalArgumentException("Username đã được sử dụng");
        };

        if(userRepository.findByEmail(request.getEmail()).isPresent()){
            throw new IllegalArgumentException("Email đã được sử dụng");
        };

        Set<String> callerRoles = getCallerRoles();
        boolean isCallerAdmin = callerRoles.contains(ROLE_ADMIN);

        if (!isCallerAdmin) {
            if (request.getRoles().stream().anyMatch(SUPERIOR_ROLES::contains)) {
                throw new AccessDeniedException("Bạn không có quyền gán vai trò (role) này.");
            }
        }
        User user = modelMapper.map(request, User.class);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRoles(getRoleFromName(request.getRoles()));
        user.getRoles().add(getRoleView());
        User savedUser = userRepository.save(user);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User initiator = userRepository.findByEmail(authentication.getName()).orElse(null);

        notificationService.createAndSendNotification(
                initiator,
                NotificationType.NEW_USER_CREATED,
                savedUser,
                Set.of("ROLE_ADMIN")
        );

        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUserProfile(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
            if (!existingUser.getId().equals(userId)) {
                throw new IllegalArgumentException("Email đã được sử dụng bởi người dùng khác");
            }
        });

        User callerUser = getCallerUser(); // Người đang thực hiện yêu cầu (caller)
        Set<String> callerRoles = getCallerRoles();
        boolean isCallerAdmin = callerRoles.contains(ROLE_ADMIN);

        // Kiểm tra xem mục tiêu sửa đổi (target) có phải là "cấp trên" không
        boolean isTargetSuperior = user.getRoles().stream()
                .anyMatch(role -> SUPERIOR_ROLES.contains(role.getName()));

        Long callerId = callerUser.getId();

        boolean isSelfEdit = callerId.equals(userId);

        if (!isCallerAdmin && isTargetSuperior && !isSelfEdit) {
            throw new IllegalArgumentException("Bạn không có quyền chỉnh sửa người dùng này.");
        }

        if (!isCallerAdmin && !isSelfEdit) {
            if (request.getRoles().stream().anyMatch(SUPERIOR_ROLES::contains)) {
                throw new IllegalArgumentException("Bạn không có quyền gán vai trò này.");
            }
        }

        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setRoles(getRoleFromName(request.getRoles()));
        user.getRoles().add(getRoleView());
        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }

    @Override
    public void changePassword(Long userId, UserPasswordChangeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if(!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())){
            throw new IllegalArgumentException("Mật khẩu cũ không đúng");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return mapToUserResponse(user);
    }

    @Override
    public Page<UserResponse> getAllUsers(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        User currentUser = getCallerUser();
        Set<String> callerRoles = getCallerRoles();
        boolean isCallerAdmin = callerRoles.contains(ROLE_ADMIN);

        Specification<User> searchSpec = UserSpecification.search(search);
        Specification<User> excludeSelfSpec = UserSpecification.excludeUserById(currentUser.getId());

        Specification<User> finalSpec;

        if (isCallerAdmin) {
            // ADMIN: Thấy tất cả người dùng khác
            finalSpec = searchSpec.and(excludeSelfSpec);
        } else {
            // MANAGER (hoặc người dùng khác): Chỉ thấy cấp dưới
            Specification<User> subordinateSpec = UserSpecification.findSubordinates(SUBORDINATE_ROLES, SUPERIOR_ROLES);
            finalSpec = searchSpec.and(excludeSelfSpec).and(subordinateSpec);
        }

        Page<User> userPage = userRepository.findAll(finalSpec, pageable);

        return userPage.map(this::mapToUserResponse);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        if(!userRepository.existsById(userId)){
            throw new ResourceNotFoundException("User", "id", userId);
        }
        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        User currentUser = getCallerUser();

        // 1. Kiểm tra tự xóa
        if (userToDelete.getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Bạn không thể tự xóa chính mình.");
        }

        Set<String> targetRoles = userToDelete.getRoles().stream()
                .map(Role::getName).collect(Collectors.toSet());
        Set<String> callerRoles = getCallerRoles();

        // 2. Kiểm tra xóa Admin
        if (targetRoles.contains(ROLE_ADMIN)) {
            throw new IllegalArgumentException("Không thể xóa Quản trị viên (Admin).");
        }

        // 3. Kiểm tra MANAGER xóa MANAGER
        if (targetRoles.contains(ROLE_MANAGER) && !callerRoles.contains(ROLE_ADMIN)) {
            throw new AccessDeniedException("Bạn không có quyền xóa người dùng này.");
        }

        Set<Role> rolesToRemove = Set.copyOf(userToDelete.getRoles());
        userToDelete.getRoles().removeAll(rolesToRemove);
        userRepository.save(userToDelete);

        userRepository.delete(userToDelete);
    }

    private Set<Role> getRoleFromName(Set<String> roleName){
        return roleName.stream().map(role ->
                    roleRepository.findByName(role)
                            .orElseThrow(() -> new ResourceNotFoundException("Role", "name", role))
                )
                .collect(Collectors.toSet());
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse dto = modelMapper.map(user, UserResponse.class);

        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
        dto.setRoles(roleNames);

        return dto;
    }
}
