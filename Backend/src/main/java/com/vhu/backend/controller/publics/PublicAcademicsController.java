package com.vhu.backend.controller.publics;

import com.vhu.backend.dto.academics.response.MajorResponse;
import com.vhu.backend.dto.academics.response.ProgramLevelResponse;
import com.vhu.backend.service.MajorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicAcademicsController {

    private final MajorService majorService;

    /**
     * API Public: Lấy danh sách các Hệ đào tạo
     */
    @GetMapping("/program-levels/{lang}")
    public ResponseEntity<List<ProgramLevelResponse>> getPublicProgramLevels(@PathVariable String lang) {
        return ResponseEntity.ok(majorService.getAllProgramLevels(lang));
    }

    /**
     * API Public: Lấy danh sách tất cả các Ngành học
     */
    @GetMapping("/majors/{lang}")
    public ResponseEntity<List<MajorResponse>> getPublicMajors(@PathVariable String lang) {
        return ResponseEntity.ok(majorService.getPublicMajors(lang));
    }
}