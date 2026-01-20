package com.vhu.backend.repository;

import com.vhu.backend.entity.Slide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface SlideRepository extends JpaRepository<Slide, Long> {
    List<Slide> findAllByOrderByDisplayOrderAsc();

    List<Slide> findByIsActiveTrueOrderByDisplayOrderAsc();

    @Query("SELECT MAX(s.displayOrder) FROM Slide s")
    Optional<Integer> findMaxDisplayOrder();
}