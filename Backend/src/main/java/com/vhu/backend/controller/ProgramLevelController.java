package com.vhu.backend.controller;

import com.vhu.backend.dto.academics.request.ProgramLevelRequest;
import com.vhu.backend.dto.academics.response.ProgramLevelResponse;
import com.vhu.backend.service.MajorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/program-levels")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
public class ProgramLevelController {

    private final MajorService majorService;

    @PostMapping
    public ResponseEntity<ProgramLevelResponse> createProgramLevel(@Valid @RequestBody ProgramLevelRequest request) {
        return new ResponseEntity<>(majorService.createProgramLevel(request), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<ProgramLevelResponse>> getAllProgramLevels(@RequestParam(defaultValue = "vi") String lang) {
        return ResponseEntity.ok(majorService.getAllProgramLevels(lang));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramLevelResponse> getProgramLevelById(@PathVariable Long id) {
        return ResponseEntity.ok(majorService.getProgramLevelById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgramLevelResponse> updateProgramLevel(@PathVariable Long id, @Valid @RequestBody ProgramLevelRequest request) {
        return ResponseEntity.ok(majorService.updateProgramLevel(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProgramLevel(@PathVariable Long id) {
        majorService.deleteProgramLevel(id);
        return ResponseEntity.noContent().build();
    }
}