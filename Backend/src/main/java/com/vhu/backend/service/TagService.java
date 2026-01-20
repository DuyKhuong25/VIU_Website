package com.vhu.backend.service;

import com.vhu.backend.dto.article.response.ArticleResponse;
import com.vhu.backend.dto.tag.request.TagCreateRequest;
import com.vhu.backend.dto.tag.request.TagUpdateRequest;
import com.vhu.backend.dto.tag.response.TagResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface TagService {
    TagResponse createTag(TagCreateRequest request);
    TagResponse updateTag(Integer tagId, TagUpdateRequest request);
    Page<TagResponse> getAllTags(int page, int size, String search);
    TagResponse getTagById(Integer tagId);
    void deleteTag(Integer tagId);
    List<TagResponse> findPopularTags(int limit);
    TagResponse getPublicTagBySlug(String slug);
    List<ArticleResponse> getPublicArticlesByTagSlug(String slug, String languageCode);
    List<TagResponse> getPublicPopularTags(int limit);
}