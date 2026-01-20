package com.vhu.backend.service.impl;

import com.vhu.backend.dto.category.request.CategoryCreateRequest;
import com.vhu.backend.dto.category.request.CategoryUpdateRequest;
import com.vhu.backend.dto.category.response.CategoryResponse;
import com.vhu.backend.dto.category.response.CategoryTranslationResponse;
import com.vhu.backend.entity.Category;
import com.vhu.backend.entity.CategoryTranslation;
import com.vhu.backend.exception.ResourceNotFoundException;
import com.vhu.backend.repository.CategoryRepository;
import com.vhu.backend.repository.CategoryTranslationRepository;
import com.vhu.backend.service.CategoryService;
import com.vhu.backend.utils.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryTranslationRepository categoryTranslationRepository;
    private final ModelMapper modelMapper;

//    @Override
//    @Transactional
//    public CategoryResponse createCategory(CategoryCreateRequest request) {
//        Category category = new Category();
//
//        if (request.getParentId() != null) {
//            category.setShowOnHomepage(false);
//            Category parent = categoryRepository.findById(request.getParentId())
//                    .orElseThrow(() -> new ResourceNotFoundException("Category Parent", "id", request.getParentId()));
//            category.setParent(parent);
//        }else{
//            category.setShowOnHomepage(request.isShowOnHomepage());
//        }
//
//        List<CategoryTranslation> translations = request.getTranslations().stream().map(transDto -> {
//            String slug = SlugUtil.toSlug(transDto.getName());
//            if(categoryTranslationRepository.findBySlug(slug).isPresent()) {
//                throw new IllegalArgumentException("Tên danh mục đã tồn tại: " + transDto.getName());
//            }
//            CategoryTranslation translation = new CategoryTranslation();
//            translation.setCategory(category);
//            translation.setLanguageCode(transDto.getLanguageCode());
//            translation.setName(transDto.getName());
//            translation.setSlug(slug);
//            return translation;
//        }).collect(Collectors.toList());
//        category.setTranslations(translations);
//        Category finalCategory = categoryRepository.save(category);
//        return modelMapper.map(finalCategory, CategoryResponse.class);
//    }

//    @Override
//    @Transactional
//    public CategoryResponse updateCategory(Integer categoryId, CategoryUpdateRequest request) {
//        Category category = categoryRepository.findById(categoryId)
//                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
//
//        if (request.getParentId() != null) {
//            category.setShowOnHomepage(false);
//            if (request.getParentId().equals(categoryId)) {
//                throw new IllegalArgumentException("Danh mục không thể là cha của chính nó.");
//            }
//            Category parent = categoryRepository.findById(request.getParentId())
//                    .orElseThrow(() -> new ResourceNotFoundException("Category Parent", "id", request.getParentId()));
//            category.setParent(parent);
//        } else {
//            category.setShowOnHomepage(request.isShowOnHomepage());
//            category.setParent(null);
//        }
//
//        Map<String, CategoryTranslation> existingTranslations = category.getTranslations().stream()
//                .collect(Collectors.toMap(CategoryTranslation::getLanguageCode, t -> t));
//
//        for (var transDto : request.getTranslations()) {
//            String slug = SlugUtil.toSlug(transDto.getName());
//            categoryTranslationRepository.findBySlug(slug).ifPresent(existingTrans -> {
//                if (!existingTrans.getCategory().getId().equals(categoryId)) {
//                    throw new IllegalArgumentException("Tên danh mục đã tồn tại: " + transDto.getName());
//                }
//            });
//            CategoryTranslation translation = existingTranslations.get(transDto.getLanguageCode());
//            if (translation != null) {
//                translation.setName(transDto.getName());
//                translation.setSlug(slug);
//            }
//        }
//        Category updatedCategory = categoryRepository.save(category);
//        return modelMapper.map(updatedCategory, CategoryResponse.class);
//    }

//    @Override
//    public Page<CategoryResponse> getAllRootCategories(int page, int size, String search) {
//        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
//        Page<Category> categoryPage;
//
//        if (search != null && !search.isBlank()) {
//            categoryPage = categoryRepository.findDistinctByTranslations_NameContainingIgnoreCase(search, pageable);
//        } else {
//            categoryPage = categoryRepository.findByParentIsNull(pageable);
//        }
//
//        return categoryPage.map(category -> modelMapper.map(category, CategoryResponse.class));
//    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        Category category = new Category();

        if (request.getParentId() != null) {
            category.setShowOnHomepage(false);
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category Parent", "id", request.getParentId()));
            category.setParent(parent);
            category.setDisplayOrder(0);
        } else {
            category.setShowOnHomepage(request.isShowOnHomepage());
            Integer maxOrder = categoryRepository.findMaxDisplayOrderForRootCategories().orElse(0);
            category.setDisplayOrder(maxOrder + 1);
        }

        List<CategoryTranslation> translations = request.getTranslations().stream().map(transDto -> {
            String slug = SlugUtil.toSlug(transDto.getName());
            if(categoryTranslationRepository.findBySlug(slug).isPresent()) {
                throw new IllegalArgumentException("Tên danh mục đã tồn tại: " + transDto.getName());
            }
            CategoryTranslation translation = new CategoryTranslation();
            translation.setCategory(category);
            translation.setLanguageCode(transDto.getLanguageCode());
            translation.setName(transDto.getName());
            translation.setSlug(slug);
            return translation;
        }).collect(Collectors.toList());
        category.setTranslations(translations);
        Category finalCategory = categoryRepository.save(category);
        return mapCategoryToResponse(finalCategory);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Integer categoryId, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        if (request.getParentId() != null) {
            category.setShowOnHomepage(false);
            if (request.getParentId().equals(categoryId)) {
                throw new IllegalArgumentException("Danh mục không thể là cha của chính nó.");
            }
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category Parent", "id", request.getParentId()));
            category.setParent(parent);
            category.setDisplayOrder(0);
        } else {
            category.setShowOnHomepage(request.isShowOnHomepage());
            category.setParent(null);
            if (category.getDisplayOrder() == 0) {
                Integer maxOrder = categoryRepository.findMaxDisplayOrderForRootCategories().orElse(0);
                category.setDisplayOrder(maxOrder + 1);
            }
        }

        Map<String, CategoryTranslation> existingTranslations = category.getTranslations().stream()
                .collect(Collectors.toMap(CategoryTranslation::getLanguageCode, t -> t));

        for (var transDto : request.getTranslations()) {
            String slug = SlugUtil.toSlug(transDto.getName());
            categoryTranslationRepository.findBySlug(slug).ifPresent(existingTrans -> {
                if (!existingTrans.getCategory().getId().equals(categoryId)) {
                    throw new IllegalArgumentException("Tên danh mục đã tồn tại: " + transDto.getName());
                }
            });
            CategoryTranslation translation = existingTranslations.get(transDto.getLanguageCode());
            if (translation != null) {
                translation.setName(transDto.getName());
                translation.setSlug(slug);
            }
        }
        Category updatedCategory = categoryRepository.save(category);
        return mapCategoryToResponse(updatedCategory);
    }

    @Override
    public Page<CategoryResponse> getAllRootCategories(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("displayOrder").ascending());
        Page<Category> categoryPage;

        if (search != null && !search.isBlank()) {
            categoryPage = categoryRepository.findDistinctByTranslations_NameContainingIgnoreCase(search, pageable);
        } else {
            categoryPage = categoryRepository.findByParentIsNull(pageable);
        }

        return categoryPage.map(category -> mapCategoryToResponse(category));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategoriesAsTree() {
        List<Category> rootCategories = categoryRepository.findByParentIsNullOrderByDisplayOrderAsc();
        return rootCategories.stream()
                .map(this::mapCategoryToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse getCategoryById(Integer categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        return modelMapper.map(category, CategoryResponse.class);
    }

    @Override
    @Transactional
    public void deleteCategory(Integer categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            throw new IllegalArgumentException("Không thể xóa danh mục cha khi vẫn còn danh mục con.");
        }
        categoryRepository.deleteById(categoryId);
    }

    @Override
    @Transactional
    public CategoryResponse toggleShowOnHomepage(Integer categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        if (category.getParent() != null) {
            throw new IllegalArgumentException("Chỉ có thể thay đổi trạng thái hiển thị cho danh mục cha.");
        }

        category.setShowOnHomepage(!category.isShowOnHomepage());

        Category updatedCategory = categoryRepository.save(category);
        return modelMapper.map(updatedCategory, CategoryResponse.class);
    }

    @Override
    @Transactional
    public void reorderCategories(List<Integer> categoryIds) {
        for (int i = 0; i < categoryIds.size(); i++) {
            Integer categoryId = categoryIds.get(i);
            int displayOrder = i + 1;

            categoryRepository.findById(categoryId).ifPresent(category -> {
                if (category.getParent() == null) {
                    category.setDisplayOrder(displayOrder);
                    categoryRepository.save(category);
                }
            });
        }
    }

    @Override
    public CategoryResponse mapCategoryToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setShowOnHomepage(category.isShowOnHomepage());
        response.setDisplayOrder(category.getDisplayOrder());

        if (category.getParent() != null) {
            response.setParentId(category.getParent().getId());
        } else {
            response.setParentId(null);
        }

        List<CategoryTranslationResponse> translations = category.getTranslations().stream()
                .map(trans -> modelMapper.map(trans, CategoryTranslationResponse.class))
                .collect(Collectors.toList());
        response.setTranslations(translations);

        List<CategoryResponse> children = category.getChildren().stream()
                .map(this::mapCategoryToResponse)
                .collect(Collectors.toList());
        response.setChildren(children);

        return response;
    }
}