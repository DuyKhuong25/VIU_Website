package com.vhu.backend.controller.publics;

import com.vhu.backend.dto.category.response.CategoryResponse;
import com.vhu.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/categories")
@RequiredArgsConstructor
public class PublicCategoryController {

    private final CategoryService categoryService;

    @GetMapping("/tree")
    public ResponseEntity<List<CategoryResponse>> getPublicCategoryTree() {
        List<CategoryResponse> categoryTree = categoryService.getAllCategoriesAsTree();
        return ResponseEntity.ok(categoryTree);
    }
}
