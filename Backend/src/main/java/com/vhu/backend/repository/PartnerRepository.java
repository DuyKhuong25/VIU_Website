package com.vhu.backend.repository;

import com.vhu.backend.entity.Partner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, Long> {

    // Dùng để tự động gán thứ tự cho đối tác mới
    @Query("SELECT MAX(p.displayOrder) FROM Partner p")
    Optional<Integer> findMaxDisplayOrder();

    // Dùng cho API Public, lấy tất cả và sắp xếp
    List<Partner> findAllByOrderByDisplayOrderAsc();

    // Dùng để kiểm tra trùng lặp tên
    @Query("SELECT p FROM Partner p JOIN p.translations t WHERE t.languageCode = ?1 AND t.name = ?2")
    Optional<Partner> findByTranslation(String languageCode, String name);
}