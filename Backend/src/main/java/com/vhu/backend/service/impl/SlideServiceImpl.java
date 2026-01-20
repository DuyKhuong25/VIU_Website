// Công dụng: Triển khai logic nghiệp vụ hoàn chỉnh cho việc quản lý Slide.
package com.vhu.backend.service.impl;

import com.vhu.backend.dto.slide.request.SlideCreateRequest;
import com.vhu.backend.dto.slide.request.SlideTranslationRequest;
import com.vhu.backend.dto.slide.request.SlideUpdateRequest;
import com.vhu.backend.dto.slide.response.SlideResponse;
import com.vhu.backend.dto.slide.response.SlideTranslationResponse;
import com.vhu.backend.entity.*;
import com.vhu.backend.exception.ResourceNotFoundException;
import com.vhu.backend.repository.ArticleRepository;
import com.vhu.backend.repository.MediaRepository;
import com.vhu.backend.repository.SlideRepository;
import com.vhu.backend.service.FileSystemStorageService;
import com.vhu.backend.service.SlideService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SlideServiceImpl implements SlideService {

    private final SlideRepository slideRepository;
    private final MediaRepository mediaRepository;
    private final ArticleRepository articleRepository;
    private final ModelMapper modelMapper;
    private final FileSystemStorageService storageService;

    @Override
    @Transactional
    public SlideResponse createSlide(SlideCreateRequest request) {
        Media media = mediaRepository.findById(request.getMediaId())
                .orElseThrow(() -> new ResourceNotFoundException("Media", "id", request.getMediaId()));

        Slide slide = new Slide();
        slide.setMedia(media);
        slide.setActive(request.isActive());

        Integer maxOrder = slideRepository.findMaxDisplayOrder().orElse(0);
        slide.setDisplayOrder(maxOrder + 1);

        List<SlideTranslation> translations = new ArrayList<>();
        for (SlideTranslationRequest transDto : request.getTranslations()) {
            SlideTranslation translation = new SlideTranslation();
            translation.setSlide(slide);
            translation.setLanguageCode(transDto.getLanguageCode());
            translation.setTitle(transDto.getTitle());
            translation.setDescription(transDto.getDescription()); // Đảm bảo description được set

            if (transDto.getLinkedArticleId() != null) {
                Article linkedArticle = articleRepository.findById(transDto.getLinkedArticleId())
                        .orElseThrow(() -> new ResourceNotFoundException("Article", "id", transDto.getLinkedArticleId()));
                translation.setLinkedArticle(linkedArticle);
            } else {
                translation.setExternalLinkUrl(transDto.getExternalLinkUrl());
            }
            translations.add(translation);
        }
        slide.setTranslations(translations);

        Slide savedSlide = slideRepository.save(slide);

        try {
            String permanentFolder = String.format("slides/%d", savedSlide.getId());

            String newRelativePath = storageService.moveFile(media.getS3Key(), permanentFolder);

            media.setS3Key(newRelativePath);
            String newFileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(newRelativePath)
                    .toUriString();
            media.setUrl(newFileUrl);

        } catch (IOException e) {
            throw new RuntimeException("Không thể di chuyển file ảnh cho slide: " + e.getMessage());
        }

        media.setOwnerId(savedSlide.getId());
        media.setOwnerType("SLIDE");
        mediaRepository.save(media);

        return mapToSlideResponse(savedSlide);
    }

    @Override
    @Transactional
    public SlideResponse updateSlide(Long slideId, SlideUpdateRequest request) {
        Slide slide = slideRepository.findById(slideId)
                .orElseThrow(() -> new ResourceNotFoundException("Slide", "id", slideId));

        Media newMedia = mediaRepository.findById(request.getMediaId())
                .orElseThrow(() -> new ResourceNotFoundException("Media", "id", request.getMediaId()));

        if (!slide.getMedia().getId().equals(newMedia.getId())) {
            Media oldMedia = slide.getMedia();

            try {
                String permanentFolder = String.format("slides/%d", slide.getId());
                String newRelativePath = storageService.moveFile(newMedia.getS3Key(), permanentFolder);

                newMedia.setS3Key(newRelativePath);
                String newFileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/uploads/").path(newRelativePath).toUriString();
                newMedia.setUrl(newFileUrl);
                newMedia.setOwnerId(slide.getId());
                newMedia.setOwnerType("SLIDE");
                mediaRepository.save(newMedia);

            } catch (IOException e) {
                throw new RuntimeException("Không thể di chuyển file ảnh mới cho slide: " + e.getMessage());
            }

            slide.setMedia(newMedia);

            storageService.delete(oldMedia.getS3Key());
            oldMedia.setOwnerId(null);
            oldMedia.setOwnerType(null);
            mediaRepository.save(oldMedia);
        }

        slide.setActive(request.isActive());

        Map<String, SlideTranslation> existingTranslationsMap = slide.getTranslations().stream()
                .collect(Collectors.toMap(SlideTranslation::getLanguageCode, t -> t));

        for (var transDto : request.getTranslations()) {
            SlideTranslation translationToUpdate = existingTranslationsMap.get(transDto.getLanguageCode());

            if (translationToUpdate != null) {
                translationToUpdate.setTitle(transDto.getTitle());
                translationToUpdate.setDescription(transDto.getDescription());

                if (transDto.getLinkedArticleId() != null) {
                    Article linkedArticle = articleRepository.findById(transDto.getLinkedArticleId())
                            .orElseThrow(() -> new ResourceNotFoundException("Article", "id", transDto.getLinkedArticleId()));
                    translationToUpdate.setLinkedArticle(linkedArticle);
                    translationToUpdate.setExternalLinkUrl(null);
                } else {
                    translationToUpdate.setLinkedArticle(null);
                    translationToUpdate.setExternalLinkUrl(transDto.getExternalLinkUrl());
                }
            }
        }

        Slide updatedSlide = slideRepository.save(slide);
        return mapToSlideResponse(updatedSlide);
    }

    @Override
    public List<SlideResponse> getAllSlidesForAdmin() {
        return slideRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(this::mapToSlideResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteSlide(Long slideId) {
        Slide slide = slideRepository.findById(slideId)
                .orElseThrow(() -> new ResourceNotFoundException("Slide", "id", slideId));

        Media media = slide.getMedia();
        if (media != null) {
            storageService.delete(media.getS3Key());

            media.setOwnerId(null);
            media.setOwnerType(null);
            mediaRepository.save(media);
        }

        slideRepository.delete(slide);
    }

    @Override
    @Transactional
    public SlideResponse toggleStatus(Long slideId) {
        Slide slide = slideRepository.findById(slideId)
                .orElseThrow(() -> new ResourceNotFoundException("Slide", "id", slideId));
        slide.setActive(!slide.isActive());
        Slide updatedSlide = slideRepository.save(slide);
        return mapToSlideResponse(updatedSlide);
    }

    @Override
    @Transactional
    public void reorderSlides(List<Long> slideIds) {
        for (int i = 0; i < slideIds.size(); i++) {
            int displayOrder = i + 1;
            Long slideId = slideIds.get(i);
            slideRepository.findById(slideId).ifPresent(slide -> {
                slide.setDisplayOrder(displayOrder);
                slideRepository.save(slide);
            });
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlideResponse> getActiveSlides() {
        List<Slide> activeSlides = slideRepository.findByIsActiveTrueOrderByDisplayOrderAsc();

        return activeSlides.stream()
                .map(this::mapToSlideResponse)
                .collect(Collectors.toList());
    }

    private SlideResponse mapToSlideResponse(Slide slide) {
        SlideResponse response = new SlideResponse();

        response.setId(slide.getId());
        response.setDisplayOrder(slide.getDisplayOrder());
        response.setActive(slide.isActive());

        if (slide.getMedia() != null) {
            response.setImageUrl(slide.getMedia().getUrl());
            response.setMediaId(slide.getMedia().getId());
        }

        List<SlideTranslationResponse> transResponses = slide.getTranslations().stream()
                .map(originalTrans -> {
                    SlideTranslationResponse transRes = new SlideTranslationResponse();
                    transRes.setLanguageCode(originalTrans.getLanguageCode());
                    transRes.setTitle(originalTrans.getTitle());
                    transRes.setDescription(originalTrans.getDescription());

                    if (originalTrans.getLinkedArticle() != null) {
                        Article linkedArticle = originalTrans.getLinkedArticle();
                        transRes.setLinkedArticleId(linkedArticle.getId());

                        String slug = linkedArticle.getTranslations().stream()
                                .filter(artTrans -> artTrans.getLanguageCode().equals(transRes.getLanguageCode()))
                                .findFirst().map(ArticleTranslation::getSlug).orElse("");
                        transRes.setLinkUrl(String.format("/article/%s", slug));
                    } else {
                        transRes.setLinkUrl(originalTrans.getExternalLinkUrl());
                    }
                    return transRes;
                }).collect(Collectors.toList());

        response.setTranslations(transResponses);
        return response;
    }
}