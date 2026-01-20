package com.vhu.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "program_level_translations")
@Data
public class ProgramLevelTranslation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_level_id")
    private ProgramLevel programLevel;

    private String languageCode;
    private String name;
}