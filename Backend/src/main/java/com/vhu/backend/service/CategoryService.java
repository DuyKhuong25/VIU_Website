
package com.vhu.backend.service;

import com.vhu.backend.dto.category.request.CategoryCreateRequest;
import com.vhu.backend.dto.category.request.CategoryUpdateRequest;
import com.vhu.backend.dto.category.response.CategoryResponse;
import com.vhu.backend.entity.Category;
import org.springframework.data.domain.Page;

import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(CategoryCreateRequest request);
    CategoryResponse updateCategory(Integer categoryId, CategoryUpdateRequest request);
    Page<CategoryResponse> getAllRootCategories(int page, int size, String search);
    List<CategoryResponse> getAllCategoriesAsTree();
    CategoryResponse getCategoryById(Integer categoryId);
    void deleteCategory(Integer categoryId);
    CategoryResponse toggleShowOnHomepage(Integer categoryId);
    CategoryResponse mapCategoryToResponse(Category category);
    void reorderCategories(List<Integer> categoryIds);
}