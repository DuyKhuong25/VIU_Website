package com.vhu.backend.service;

import com.vhu.backend.dto.academics.request.MajorRequest;
import com.vhu.backend.dto.academics.request.ProgramLevelRequest;
import com.vhu.backend.dto.academics.response.MajorResponse;
import com.vhu.backend.dto.academics.response.ProgramLevelResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MajorService {

    // --- CRUD cho Chương trình đào tạo ---

    ProgramLevelResponse createProgramLevel(ProgramLevelRequest request);

    List<ProgramLevelResponse> getAllProgramLevels(String lang);

    ProgramLevelResponse getProgramLevelById(Long id);

    ProgramLevelResponse updateProgramLevel(Long id, ProgramLevelRequest request);

    void deleteProgramLevel(Long id);

    // --- CRUD cho Ngành đào tạo ---

    MajorResponse createMajor(MajorRequest request);

    Page<MajorResponse> getAllMajors(Pageable pageable, String lang);

    MajorResponse getMajorById(Long id);

    MajorResponse updateMajor(Long id, MajorRequest request);

    void deleteMajor(Long id);

    // --- Public APIs ---
    List<MajorResponse> getPublicMajors(String lang);
}