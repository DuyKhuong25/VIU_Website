package com.vhu.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quick_access_links")
@Data
public class QuickAccessLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "link_url", nullable = false)
    private String linkUrl;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "icon_media_id")
    private Media icon;

    @Column(name = "display_order")
    private int displayOrder = 0;

    @Column(name = "is_active")
    private boolean isActive = true;

    @OneToMany(mappedBy = "link", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<QuickAccessLinkTranslation> translations = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}