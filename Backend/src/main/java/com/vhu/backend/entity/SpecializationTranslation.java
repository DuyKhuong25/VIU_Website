package com.vhu.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "specialization_translations")
@Data
public class SpecializationTranslation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialization_id")
    private Specialization specialization;

    private String languageCode;
    private String name;
}