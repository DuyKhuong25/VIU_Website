package com.vhu.backend.controller;

import com.vhu.backend.dto.category.request.CategoryCreateRequest;
import com.vhu.backend.dto.category.request.CategoryUpdateRequest;
import com.vhu.backend.dto.category.response.CategoryResponse;
import com.vhu.backend.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        return new ResponseEntity<>(categoryService.createCategory(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<CategoryResponse>> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false, defaultValue = "") String search
    ) {
        return ResponseEntity.ok(categoryService.getAllRootCategories(page, size, search));
    }

    @GetMapping("/all-tree")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<List<CategoryResponse>> getAllCategoriesAsTree() {
        return ResponseEntity.ok(categoryService.getAllCategoriesAsTree());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable("id") Integer categoryId) {
        return ResponseEntity.ok(categoryService.getCategoryById(categoryId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable("id") Integer categoryId,
                                                           @Valid @RequestBody CategoryUpdateRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(categoryId, request));
    }

    @PatchMapping("/{id}/toggle-homepage")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<CategoryResponse> toggleShowOnHomepage(@PathVariable("id") Integer categoryId) {
        return ResponseEntity.ok(categoryService.toggleShowOnHomepage(categoryId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable("id") Integer categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reorder")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EDITOR')")
    public ResponseEntity<Void> reorderCategories(@RequestBody List<Integer> categoryIds) {
        categoryService.reorderCategories(categoryIds);
        return ResponseEntity.ok().build();
    }
}