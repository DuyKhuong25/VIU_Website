package com.vhu.backend.service.impl;

import com.vhu.backend.dto.academics.response.TranslationResponse;
import com.vhu.backend.dto.partner.request.PartnerRequest;
import com.vhu.backend.dto.partner.response.PartnerResponse;
import com.vhu.backend.entity.Media;
import com.vhu.backend.entity.Partner;
import com.vhu.backend.entity.PartnerTranslation;
import com.vhu.backend.exception.DuplicateResourceException;
import com.vhu.backend.exception.ResourceNotFoundException;
import com.vhu.backend.repository.MediaRepository;
import com.vhu.backend.repository.PartnerRepository;
import com.vhu.backend.service.FileSystemStorageService;
import com.vhu.backend.service.PartnerService;
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
public class PartnerServiceImpl implements PartnerService {

    private final PartnerRepository partnerRepository;
    private final MediaRepository mediaRepository;
    private final FileSystemStorageService storageService;

    @Override
    @Transactional
    public PartnerResponse createPartner(PartnerRequest request) {
        // Kiểm tra trùng lặp tên
        checkPartnerDuplicates(null, request.getTranslations());

        Media logoMedia = mediaRepository.findById(request.getLogoMediaId())
                .orElseThrow(() -> new ResourceNotFoundException("Media", "id", request.getLogoMediaId()));

        Partner partner = new Partner();
        partner.setWebsiteUrl(request.getWebsiteUrl());
        partner.setLogo(logoMedia);

        // Tự động gán thứ tự hiển thị mới
        Integer maxOrder = partnerRepository.findMaxDisplayOrder().orElse(-1);
        partner.setDisplayOrder(maxOrder + 1);

        request.getTranslations().forEach(transDto -> {
            PartnerTranslation translation = new PartnerTranslation();
            translation.setPartner(partner);
            translation.setLanguageCode(transDto.getLanguageCode());
            translation.setName(transDto.getTitle());
            partner.getTranslations().add(translation);
        });

        Partner savedPartner = partnerRepository.saveAndFlush(partner);
        Long partnerId = savedPartner.getId();

        // Di chuyển file từ /temp và gán chủ sở hữu
        try {
            String permanentFolder = "partners/" + partnerId;
            String newPath = storageService.moveFile(logoMedia.getS3Key(), permanentFolder);

            logoMedia.setS3Key(newPath);
            logoMedia.setUrl(storageService.buildUrl(newPath));
            logoMedia.setOwnerId(partnerId);
            logoMedia.setOwnerType("PARTNER");
            mediaRepository.save(logoMedia);

        } catch (IOException e) {
            throw new RuntimeException("Lỗi di chuyển file logo: " + e.getMessage());
        }

        return mapToDetailResponse(savedPartner);
    }

    @Override
    @Transactional
    public PartnerResponse updatePartner(Long id, PartnerRequest request) {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partner", "id", id));

        // Kiểm tra trùng lặp tên
        checkPartnerDuplicates(id, request.getTranslations());

        // Logic "thông minh" xử lý logo
        if (request.getLogoMediaId() != null && !partner.getLogo().getId().equals(request.getLogoMediaId())) {
            Media newLogo = mediaRepository.findById(request.getLogoMediaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Media", "id", request.getLogoMediaId()));
            Media oldLogo = partner.getLogo();

            try {
                String folder = "partners/" + id;
                String newPath = storageService.moveFile(newLogo.getS3Key(), folder);
                newLogo.setS3Key(newPath);
                newLogo.setUrl(storageService.buildUrl(newPath));
                newLogo.setOwnerId(id);
                newLogo.setOwnerType("PARTNER");
                mediaRepository.save(newLogo);

                storageService.delete(oldLogo.getS3Key());
                oldLogo.setOwnerId(null);
                oldLogo.setOwnerType(null);
                mediaRepository.save(oldLogo);
            } catch (IOException e) {
                throw new RuntimeException("Lỗi cập nhật file logo: " + e.getMessage());
            }
            partner.setLogo(newLogo);
        }

        partner.setWebsiteUrl(request.getWebsiteUrl());

        // Cập nhật các bản dịch
        Map<String, PartnerTranslation> existingTranslations = partner.getTranslations().stream()
                .collect(Collectors.toMap(PartnerTranslation::getLanguageCode, t -> t));

        request.getTranslations().forEach(transDto -> {
            PartnerTranslation translation = existingTranslations.get(transDto.getLanguageCode());
            if (translation != null) {
                translation.setName(transDto.getTitle());
            } else {
                PartnerTranslation newTranslation = new PartnerTranslation();
                newTranslation.setPartner(partner);
                newTranslation.setLanguageCode(transDto.getLanguageCode());
                newTranslation.setName(transDto.getTitle());
                partner.getTranslations().add(newTranslation);
            }
        });

        Partner updatedPartner = partnerRepository.save(partner);
        return mapToDetailResponse(updatedPartner);
    }

    @Override
    @Transactional
    public void deletePartner(Long id) {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partner", "id", id));

        Media logo = partner.getLogo();

        partnerRepository.delete(partner);

        if (logo != null) {
            storageService.delete(logo.getS3Key());
            mediaRepository.delete(logo);
        }
    }

    @Override
    @Transactional
    public void reorderPartners(List<Long> partnerIds) {
        for (int i = 0; i < partnerIds.size(); i++) {
            Long id = partnerIds.get(i);
            int order = i;
            partnerRepository.findById(id).ifPresent(p -> {
                p.setDisplayOrder(order);
                partnerRepository.save(p);
            });
        }
    }

    // --- API CÔNG KHAI ---
    @Override
    public List<PartnerResponse> getPublicPartners(String lang) {
        return partnerRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(this::mapToDetailResponse)
                .collect(Collectors.toList());
    }

    // --- API QUẢN TRỊ ---
    @Override
    public Page<PartnerResponse> getAdminPartners(Pageable pageable, String lang) {
        return partnerRepository.findAll(pageable).map(p -> mapToSimpleResponse(p, lang));
    }

    @Override
    public PartnerResponse getPartnerById(Long id) {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partner", "id", id));
        return mapToDetailResponse(partner);
    }

    // --- HÀM TIỆN ÍCH ---

    private void checkPartnerDuplicates(Long currentId, List<com.vhu.backend.dto.request.TranslationRequest> translations) {
        for (var trans : translations) {
            partnerRepository.findByTranslation(trans.getLanguageCode(), trans.getTitle()).ifPresent(existing -> {
                if (currentId == null || !existing.getId().equals(currentId)) {
                    String fieldName = trans.getLanguageCode().equals("vi") ? "translations[0].title" : "translations[1].title";
                    throw new DuplicateResourceException(fieldName + ":Tên đối tác (" + trans.getLanguageCode() + ") này đã tồn tại.");
                }
            });
        }
    }

    // Map cho danh sách (chỉ 1 ngôn ngữ)
    private PartnerResponse mapToSimpleResponse(Partner partner, String lang) {
        PartnerResponse res = new PartnerResponse();
        res.setId(partner.getId());
        res.setWebsiteUrl(partner.getWebsiteUrl());
        res.setDisplayOrder(partner.getDisplayOrder());
        res.setCreatedAt(partner.getCreatedAt());

        if (partner.getLogo() != null) {
            res.setLogoUrl(partner.getLogo().getUrl());
            res.setLogoMediaId(partner.getLogo().getId());
        }

        partner.getTranslations().stream()
                .filter(t -> lang.equalsIgnoreCase(t.getLanguageCode()))
                .findFirst()
                .ifPresentOrElse(
                        trans -> res.setName(trans.getName()),
                        () -> partner.getTranslations().stream().findFirst()
                                .ifPresent(anyTrans -> res.setName(anyTrans.getName()))
                );
        return res;
    }

    // Map cho chi tiết/form (tất cả ngôn ngữ)
    private PartnerResponse mapToDetailResponse(Partner partner) {
        PartnerResponse res = mapToSimpleResponse(partner, "vi");

        List<TranslationResponse> translations = partner.getTranslations().stream().map(t -> {
            TranslationResponse transDto = new TranslationResponse();
            transDto.setLanguageCode(t.getLanguageCode());
            transDto.setTitle(t.getName());
            return transDto;
        }).collect(Collectors.toList());

        res.setTranslations(translations);
        return res;
    }

    private String buildUrl(String relativePath) {
        // Tái sử dụng hàm buildUrl từ FileSystemStorageService
        return storageService.buildUrl(relativePath);
    }
}