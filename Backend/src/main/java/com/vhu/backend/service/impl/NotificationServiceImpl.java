// Công dụng: Logic chính để tạo, lấy và quản lý thông báo.
package com.vhu.backend.service.impl;

import com.vhu.backend.dto.notification.NotificationResponse;
import com.vhu.backend.entity.*;
import com.vhu.backend.exception.ResourceNotFoundException;
import com.vhu.backend.repository.NotificationRepository;
import com.vhu.backend.repository.UserRepository;
import com.vhu.backend.service.FirebaseMessagingService;
import com.vhu.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final FirebaseMessagingService firebaseMessagingService;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public void createAndSendNotification(User initiator, NotificationType type, Object contextObject, Set<String> targetRoles) {
        String message = "";
        String link = "";

        switch (type) {
            case ARTICLE_SUBMITTED_FOR_REVIEW:
                Article article = (Article) contextObject;
                String title = article.getTranslations().stream().filter(t -> "vi".equals(t.getLanguageCode())).findFirst().map(ArticleTranslation::getTitle).orElse("Không có tiêu đề");
                message = "Bài viết '" + title + "' đang chờ bạn duyệt.";
                link = "/articles/edit/" + article.getId();
                break;
            case NEW_USER_CREATED:
                User newUser = (User) contextObject;
                message = "Một tài khoản mới đã được tạo: " + newUser.getUsername();
                link = "/users";
                break;
            default:
                return;
        }

        Set<User> recipients = userRepository.findUsersByRoleNames(targetRoles);
        if (initiator != null) {
            recipients.remove(initiator);
        }

        if (recipients.isEmpty()) return;

        final String finalMessage = message;
        final String finalLink = link;

        recipients.forEach(recipient -> {
            Notification notification = new Notification();
            notification.setRecipient(recipient);
            notification.setMessage(finalMessage);
            notification.setLink(finalLink);
            notification.setType(type);
            notification.setRead(false);
            notificationRepository.save(notification);
        });

        // Gửi tín hiệu chung đến topic mà các admin/manager đang lắng nghe
        firebaseMessagingService.sendNotification("Bạn có thông báo mới!", message, "ADMIN_NOTIFICATIONS");
    }

    @Override
    public Page<NotificationResponse> getNotificationsForCurrentUser(int page, int size) {
        User currentUser = getCurrentUser();

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Notification> notificationsPage = notificationRepository.findByRecipientOrderByCreatedAtDesc(currentUser, pageable);

        return notificationsPage.map(this::mapToNotificationResponse);
    }

    @Override
    public List<NotificationResponse> getRecentNotificationsForCurrentUser() {
        User currentUser = getCurrentUser();
        List<Notification> notifications = notificationRepository.findTop7ByRecipientOrderByCreatedAtDesc(currentUser);
        return notifications.stream()
                .map(this::mapToNotificationResponse)
                .collect(Collectors.toList());
    }

    @Override
    public long getUnreadNotificationCountForCurrentUser() {
        User currentUser = getCurrentUser();
        return notificationRepository.countByRecipientAndIsReadFalse(currentUser);
    }

    @Override
    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        User currentUser = getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền truy cập thông báo này.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllNotificationsAsReadForCurrentUser() {
        User currentUser = getCurrentUser();
        notificationRepository.markAllAsReadForUser(currentUser);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        return userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));
    }

    @Override
    public void subscribeToTopic(String token) {
        firebaseMessagingService.subscribeToTopic(token, "ADMIN_NOTIFICATIONS");
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        User currentUser = getCurrentUser();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền xóa thông báo này.");
        }

        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void deleteAllNotificationsForCurrentUser() {
        User currentUser = getCurrentUser();
        notificationRepository.deleteByRecipient(currentUser);
    }

    private NotificationResponse mapToNotificationResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setMessage(notification.getMessage());
        response.setLink(notification.getLink());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        if (notification.getType() != null) {
            response.setType(notification.getType().toString());
        }
        return response;
    }
}