package com.vhu.backend.service;

import com.vhu.backend.dto.partner.request.PartnerRequest;
import com.vhu.backend.dto.partner.response.PartnerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PartnerService {

    // --- API ADMIN ---
    PartnerResponse createPartner(PartnerRequest request);

    PartnerResponse updatePartner(Long id, PartnerRequest request);

    void deletePartner(Long id);

    void reorderPartners(List<Long> partnerIds);

    Page<PartnerResponse> getAdminPartners(Pageable pageable, String lang);

    PartnerResponse getPartnerById(Long id);

    // --- API PUBLIC ---
    List<PartnerResponse> getPublicPartners(String lang);
}