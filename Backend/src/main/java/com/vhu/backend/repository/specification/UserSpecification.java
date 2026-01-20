package com.vhu.backend.repository.specification;

import com.vhu.backend.entity.Role;
import com.vhu.backend.entity.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.Set;

public class UserSpecification {
    public static Specification<User> search(String keyword){
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.isBlank()) {
                return criteriaBuilder.conjunction();
            }
            String likePattern = "%" + keyword.toLowerCase() + "%";
            // Tạo điều kiện OR: username LIKE %keyword% OR fullName LIKE %keyword% OR email LIKE %keyword%
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("username")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), likePattern)
            );
        };
    }

    // --- Specification để loại trừ một User ID cụ thể ---
    public static Specification<User> excludeUserById(Long userId) {
        return (root, query, criteriaBuilder) -> {
            if (userId == null) {
                return criteriaBuilder.conjunction(); // Không làm gì nếu không có ID
            }
            // Trả về điều kiện "WHERE id != userId"
            return criteriaBuilder.notEqual(root.get("id"), userId);
        };
    }

    // --- Specification cho MANAGER ---
    /**
     * Lọc người dùng cho Manager:
     * 1. Chỉ lấy người dùng có quyền trong 'subordinateRoles' (VD: EDITOR, VIEW)
     * 2. Phải loại trừ bất kỳ ai có quyền trong 'superiorRoles' (VD: ADMIN, MANAGER)
     */
    public static Specification<User> findSubordinates(Set<String> subordinateRoles, Set<String> superiorRoles) {
        return (root, query, criteriaBuilder) -> {
            // Đảm bảo không fetch trùng lặp
            query.distinct(true);

            // Join với bảng 'roles'
            Join<User, Role> roleJoin = root.join("roles");

            // 1. Phải có ít nhất 1 quyền trong subordinateRoles (EDITOR, VIEW)
            Predicate hasSubordinateRole = roleJoin.get("name").in(subordinateRoles);

            // 2. Không được có bất kỳ quyền nào trong superiorRoles (ADMIN, MANAGER)
            // Tạo subquery để tìm ID của các user "cấp cao"
            Specification<User> isSuperior = (subRoot, subQuery, subCb) -> {
                Join<User, Role> subRoleJoin = subRoot.join("roles");
                return subRoleJoin.get("name").in(superiorRoles);
            };
            // Điều kiện là: user.id không có trong (danh sách ID của ADMIN/MANAGER)
            Predicate notSuperior = criteriaBuilder.not(isSuperior.toPredicate(root, query, criteriaBuilder));

            // Kết hợp: (Có quyền EDITOR/VIEW) & KHÔNG có quyền ADMIN/MANAGER)

            // Lấy ID của tất cả user có quyền cấp cao
            var subquery = query.subquery(Long.class);
            var subRoot = subquery.from(User.class);
            var subRoleJoin = subRoot.join("roles");
            subquery.select(subRoot.get("id")).where(subRoleJoin.get("name").in(superiorRoles));

            // Điều kiện cuối cùng: id KHÔNG NẰM TRONG danh sách ID cấp cao
            return criteriaBuilder.not(root.get("id").in(subquery));
        };
    }
}
