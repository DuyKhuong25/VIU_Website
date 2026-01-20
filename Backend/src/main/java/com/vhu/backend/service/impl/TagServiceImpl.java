package com.vhu.backend.service.impl;

import com.vhu.backend.dto.article.response.ArticleResponse;
import com.vhu.backend.dto.tag.request.TagCreateRequest;
import com.vhu.backend.dto.tag.request.TagUpdateRequest;
import com.vhu.backend.dto.tag.response.TagResponse;
import com.vhu.backend.entity.ArticleStatus;
import com.vhu.backend.entity.Tag;
import com.vhu.backend.entity.TagTranslation;
import com.vhu.backend.exception.ResourceNotFoundException;
import com.vhu.backend.repository.TagRepository;
import com.vhu.backend.repository.TagTranslationRepository;
import com.vhu.backend.service.ArticleService;
import com.vhu.backend.service.TagService;
import com.vhu.backend.utils.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.vhu.backend.entity.Article;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;
    private final TagTranslationRepository tagTranslationRepository;
    private final ModelMapper modelMapper;
    private final ArticleService articleService;

    @Override
    @Transactional
    public TagResponse createTag(TagCreateRequest request) {
        Tag tag = new Tag();
        request.getTranslations().forEach(transDto -> {
            String slug = SlugUtil.toSlug(transDto.getName());
            if(tagTranslationRepository.findBySlug(slug).isPresent()) {
                throw new IllegalArgumentException("Tên thẻ đã tồn tại: " + transDto.getName());
            }
            TagTranslation translation = new TagTranslation();
            translation.setLanguageCode(transDto.getLanguageCode());
            translation.setName(transDto.getName());
            translation.setSlug(slug);
            translation.setTag(tag);
            tag.getTranslations().add(translation);
        });
        Tag savedTag = tagRepository.save(tag);
        return modelMapper.map(savedTag, TagResponse.class);
    }

    @Override
    @Transactional
    public TagResponse updateTag(Integer tagId, TagUpdateRequest request) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", "id", tagId));
        Map<String, TagTranslation> existingTranslations = tag.getTranslations().stream()
                .collect(Collectors.toMap(TagTranslation::getLanguageCode, t -> t));
        for (var transDto : request.getTranslations()) {
            String slug = SlugUtil.toSlug(transDto.getName());
            tagTranslationRepository.findBySlug(slug).ifPresent(existingTrans -> {
                if (!existingTrans.getTag().getId().equals(tagId)) {
                    throw new IllegalArgumentException("Tên thẻ đã tồn tại: " + transDto.getName());
                }
            });
            TagTranslation translation = existingTranslations.get(transDto.getLanguageCode());
            if (translation != null) {
                translation.setName(transDto.getName());
                translation.setSlug(slug);
            }
        }
        Tag updatedTag = tagRepository.save(tag);
        return modelMapper.map(updatedTag, TagResponse.class);
    }

    @Override
    public Page<TagResponse> getAllTags(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Tag> tagPage;

        if (search != null && !search.isBlank()) {
            tagPage = tagRepository.findDistinctByTranslations_NameContainingIgnoreCase(search, pageable);
        } else {
            tagPage = tagRepository.findAll(pageable);
        }

        return tagPage.map(tag -> modelMapper.map(tag, TagResponse.class));
    }

    @Override
    public TagResponse getTagById(Integer tagId) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", "id", tagId));
        return modelMapper.map(tag, TagResponse.class);
    }

    @Override
    @Transactional
    public void deleteTag(Integer tagId) {
        if (!tagRepository.existsById(tagId)) {
            throw new ResourceNotFoundException("Tag", "id", tagId);
        }
        tagRepository.deleteById(tagId);
    }

    @Override
    public List<TagResponse> findPopularTags(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Tag> popularTags = tagRepository.findPopularTags(pageable);
        return popularTags.stream()
                .map(tag -> modelMapper.map(tag, TagResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TagResponse getPublicTagBySlug(String slug) {
        TagTranslation translation = tagTranslationRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", "slug", slug));
        return modelMapper.map(translation.getTag(), TagResponse.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ArticleResponse> getPublicArticlesByTagSlug(String slug, String languageCode) {
        TagTranslation translation = tagTranslationRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Tag", "slug", slug));

        Tag tag = translation.getTag();

        return tag.getArticles().stream()
                .filter(article -> article.getStatus() == ArticleStatus.PUBLISHED)
                .sorted(Comparator.comparing(Article::isPinned).reversed()
                        .thenComparing(Article::getPublishedAt).reversed())
                .map(article -> articleService.mapToArticleResponse(article, languageCode))
                .collect(Collectors.toList());
    }

    @Override
    public List<TagResponse> getPublicPopularTags(int limit) {
        return this.findPopularTags(limit);
    }
}