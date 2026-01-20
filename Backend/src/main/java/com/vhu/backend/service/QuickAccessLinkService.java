package com.vhu.backend.service;

import com.vhu.backend.dto.quick_access.request.QuickAccessLinkRequest;
import com.vhu.backend.dto.quick_access.response.QuickAccessLinkResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface QuickAccessLinkService {
    QuickAccessLinkResponse createLink(QuickAccessLinkRequest request);

    Page<QuickAccessLinkResponse> getAllLinks(Pageable pageable, String lang);

    QuickAccessLinkResponse getLinkById(Long id);

    QuickAccessLinkResponse updateLink(Long id, QuickAccessLinkRequest request);

    void deleteLink(Long id);

    void updateLinkOrder(List<Long> linkIds);

    List<QuickAccessLinkResponse> getActiveLinks();
}