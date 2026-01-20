package com.vhu.backend.repository;

import com.vhu.backend.entity.QuickAccessLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuickAccessLinkRepository extends JpaRepository<QuickAccessLink, Long> {
    @Query("SELECT MAX(q.displayOrder) FROM QuickAccessLink q")
    Optional<Integer> findMaxDisplayOrder();

    List<QuickAccessLink> findByIsActiveTrueOrderByDisplayOrderAsc();
}