package com.vhu.backend.service;

import com.vhu.backend.dto.notification.NotificationResponse;
import com.vhu.backend.entity.NotificationType;
import com.vhu.backend.entity.User;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Set;

public interface NotificationService {
    void createAndSendNotification(User initiator, NotificationType type, Object contextObject, Set<String> targetRoles);
    Page<NotificationResponse> getNotificationsForCurrentUser(int page, int size);
    List<NotificationResponse> getRecentNotificationsForCurrentUser();
    long getUnreadNotificationCountForCurrentUser();
    void markNotificationAsRead(Long notificationId);
    void markAllNotificationsAsReadForCurrentUser();
    void subscribeToTopic(String token);
    void deleteNotification(Long notificationId);
    void deleteAllNotificationsForCurrentUser();
}