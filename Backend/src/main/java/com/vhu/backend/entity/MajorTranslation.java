package com.vhu.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "major_translations")
@Data
public class MajorTranslation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "major_id")
    private Major major;

    private String languageCode;
    private String name;
}