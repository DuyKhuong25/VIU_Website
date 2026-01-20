package com.vhu.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "partner_translations")
@Data
public class PartnerTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false)
    private Partner partner;

    @Column(name = "language_code", nullable = false, length = 5)
    private String languageCode;

    @Column(nullable = false)
    private String name;
}