package com.vhu.backend.dto.academics.response;

import lombok.Data;
import java.util.List;

@Data
public class MajorResponse {
    private Long id;

    // ----- Dùng cho API /getAll (Danh sách) -----
    private String name;
    private String programLevelName;
    private Integer specializationCount;

    // ----- Dùng cho API /getById (Chi tiết & Form Sửa) -----
    private ProgramLevelResponse programLevel;
    private List<TranslationResponse> translations;
    private List<SpecializationResponse> specializations;
}