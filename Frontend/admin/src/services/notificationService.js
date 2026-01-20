// Công dụng: Chứa các hàm gọi đến API Notification của Backend.
import apiClient from './api';

// API sidebar
export const getNotifications = (page = 0, size = 15) => {
    return apiClient.get(`/notifications?page=${page}&size=${size}`);
};

// API dropdown
export const getRecentNotifications = () => {
    return apiClient.get('/notifications/recent');
};

export const markNotificationAsRead = (id) => {
    return apiClient.post(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = () => {
    return apiClient.post('/notifications/read-all');
};

export const subscribeToNotifications = (token) => {
    return apiClient.post('/notifications/subscribe', { token });
};

export const deleteNotification = (id) => {
    return apiClient.delete(`/notifications/${id}`);
};

export const deleteAllNotifications = () => {
    return apiClient.delete('/notifications/all');
};