package com.vhu.backend.service.impl;

import com.vhu.backend.dto.quick_access.request.QuickAccessLinkRequest;
import com.vhu.backend.dto.quick_access.response.QuickAccessLinkResponse;
import com.vhu.backend.dto.quick_access.response.TranslationResponse;
import com.vhu.backend.entity.Media;
import com.vhu.backend.entity.QuickAccessLink;
import com.vhu.backend.entity.QuickAccessLinkTranslation;
import com.vhu.backend.exception.ResourceNotFoundException;
import com.vhu.backend.repository.MediaRepository;
import com.vhu.backend.repository.QuickAccessLinkRepository;
import com.vhu.backend.service.FileSystemStorageService;
import com.vhu.backend.service.QuickAccessLinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuickAccessLinkServiceImpl implements QuickAccessLinkService {

    private final QuickAccessLinkRepository linkRepository;
    private final MediaRepository mediaRepository;
    private final FileSystemStorageService storageService;

    @Override
    @Transactional
    public QuickAccessLinkResponse createLink(QuickAccessLinkRequest request) {
        Media iconMedia = mediaRepository.findById(request.getIconMediaId())
                .orElseThrow(() -> new ResourceNotFoundException("Media", "id", request.getIconMediaId()));

        QuickAccessLink link = new QuickAccessLink();
        link.setLinkUrl(request.getLinkUrl());
        link.setActive(request.isActive());
        link.setIcon(iconMedia);

        Integer maxOrder = linkRepository.findMaxDisplayOrder().orElse(0);
        link.setDisplayOrder(maxOrder + 1);

        request.getTranslations().forEach(transDto -> {
            QuickAccessLinkTranslation translation = new QuickAccessLinkTranslation();
            translation.setLink(link);
            translation.setLanguageCode(transDto.getLanguageCode());
            translation.setTitle(transDto.getTitle());
            link.getTranslations().add(translation);
        });

        QuickAccessLink savedLink = linkRepository.saveAndFlush(link);

        try {
            String permanentFolder = "quick_access/" + savedLink.getId();
            String newPath = storageService.moveFile(iconMedia.getS3Key(), permanentFolder);

            iconMedia.setS3Key(newPath);
            iconMedia.setUrl(storageService.buildUrl(newPath));
            iconMedia.setOwnerId(savedLink.getId());
            iconMedia.setOwnerType("QUICK_ACCESS");
            mediaRepository.save(iconMedia);

        } catch (IOException e) {
            throw new RuntimeException("Không thể di chuyển file icon: " + e.getMessage());
        }

        return mapToDetailResponse(savedLink); // Trả về response chi tiết sau khi tạo
    }

    @Override
    @Transactional
    public QuickAccessLinkResponse updateLink(Long id, QuickAccessLinkRequest request) {
        QuickAccessLink link = linkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuickAccessLink", "id", id));

        // Xử lý khi icon thay đổi
        if (request.getIconMediaId() != null && !link.getIcon().getId().equals(request.getIconMediaId())) {
            Media newIcon = mediaRepository.findById(request.getIconMediaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Media", "id", request.getIconMediaId()));

            try {
                String permanentFolder = "quick_access/" + id;
                String newPath = storageService.moveFile(newIcon.getS3Key(), permanentFolder);
                newIcon.setS3Key(newPath);
                newIcon.setUrl(storageService.buildUrl(newPath));
                newIcon.setOwnerId(id);
                newIcon.setOwnerType("QUICK_ACCESS");
                mediaRepository.save(newIcon);

                Media oldIcon = link.getIcon();
                storageService.delete(oldIcon.getS3Key());
                oldIcon.setOwnerId(null);
                oldIcon.setOwnerType(null);
                mediaRepository.save(oldIcon);

                link.setIcon(newIcon);
            } catch (IOException e) {
                throw new RuntimeException("Không thể cập nhật file icon: " + e.getMessage());
            }
        }

        link.setLinkUrl(request.getLinkUrl());
        link.setActive(request.isActive());

        // Cập nhật các bản dịch
        Map<String, QuickAccessLinkTranslation> existingTranslations = link.getTranslations().stream()
                .collect(Collectors.toMap(QuickAccessLinkTranslation::getLanguageCode, t -> t));

        request.getTranslations().forEach(transDto -> {
            QuickAccessLinkTranslation translation = existingTranslations.get(transDto.getLanguageCode());
            if (translation != null) {
                translation.setTitle(transDto.getTitle());
            }
        });

        QuickAccessLink updatedLink = linkRepository.save(link);
        return mapToDetailResponse(updatedLink); // Trả về response chi tiết sau khi cập nhật
    }

    @Override
    @Transactional
    public void updateLinkOrder(List<Long> linkIds) {
        for (int i = 0; i < linkIds.size(); i++) {
            Long linkId = linkIds.get(i);
            int displayOrder = i + 1;
            linkRepository.findById(linkId).ifPresent(link -> {
                link.setDisplayOrder(displayOrder);
                linkRepository.save(link);
            });
        }
    }

    @Override
    public Page<QuickAccessLinkResponse> getAllLinks(Pageable pageable, String lang) {
        return linkRepository.findAll(pageable).map(link -> mapToSimpleResponse(link, lang));
    }

    @Override
    public QuickAccessLinkResponse getLinkById(Long id) {
        QuickAccessLink link = linkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuickAccessLink", "id", id));
        return mapToDetailResponse(link);
    }

    @Override
    @Transactional
    public void deleteLink(Long id) {
        QuickAccessLink link = linkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("QuickAccessLink", "id", id));

        Media icon = link.getIcon();
        if (icon != null) {
            storageService.delete(icon.getS3Key());
            icon.setOwnerId(null);
            icon.setOwnerType(null);
            mediaRepository.save(icon);
        }

        linkRepository.delete(link);
    }

    private QuickAccessLinkResponse mapToSimpleResponse(QuickAccessLink link, String lang) {
        QuickAccessLinkResponse response = new QuickAccessLinkResponse();
        response.setId(link.getId());
        response.setLinkUrl(link.getLinkUrl());
        response.setDisplayOrder(link.getDisplayOrder());
        response.setActive(link.isActive());
        response.setCreatedAt(link.getCreatedAt());

        if (link.getIcon() != null) {
            response.setIconUrl(link.getIcon().getUrl());
            // Thêm dòng này để trả về ID
            response.setLogoMediaId(link.getIcon().getId());
        }

        link.getTranslations().stream()
                .filter(t -> lang.equalsIgnoreCase(t.getLanguageCode()))
                .findFirst()
                .ifPresentOrElse(
                        trans -> response.setTitle(trans.getTitle()),
                        () -> {
                            link.getTranslations().stream().findFirst()
                                    .ifPresent(anyTrans -> response.setTitle(anyTrans.getTitle()));
                        }
                );
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuickAccessLinkResponse> getActiveLinks() {
        List<QuickAccessLink> activeLinks = linkRepository.findByIsActiveTrueOrderByDisplayOrderAsc();

        return activeLinks.stream()
                .map(this::mapToDetailResponse)
                .collect(Collectors.toList());
    }

    private QuickAccessLinkResponse mapToDetailResponse(QuickAccessLink link) {
        QuickAccessLinkResponse response = mapToSimpleResponse(link, "vi");

        List<TranslationResponse> translations = link.getTranslations().stream().map(t -> {
            TranslationResponse transDto = new TranslationResponse();
            transDto.setLanguageCode(t.getLanguageCode());
            transDto.setTitle(t.getTitle());
            return transDto;
        }).collect(Collectors.toList());

        response.setTranslations(translations);
        return response;
    }
}