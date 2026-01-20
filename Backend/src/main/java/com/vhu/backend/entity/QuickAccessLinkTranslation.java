package com.vhu.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "quick_access_link_translations")
@Data
public class QuickAccessLinkTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "link_id", nullable = false)
    private QuickAccessLink link;

    @Column(name = "language_code", nullable = false, length = 5)
    private String languageCode;

    @Column(nullable = false)
    private String title;
}