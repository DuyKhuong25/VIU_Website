package com.vhu.backend.dto.category.response;

import lombok.Data;
import java.util.List;

@Data
public class CategoryResponse {
    private Integer id;
    private Integer parentId;
    private boolean showOnHomepage;
    private Integer displayOrder;
    private List<CategoryTranslationResponse> translations;
    private List<CategoryResponse> children;
}