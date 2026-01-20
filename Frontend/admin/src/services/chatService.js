import apiClient from './api';

export const getFirebaseToken = () => {
    return apiClient.post('/auth/firebase-token');
};

export const postAdminMessage = (firestoreId, messageData) => {
    return apiClient.post(`/admin/chat/conversations/${firestoreId}/messages`, messageData);
};

export const markAsRead = (firestoreId) => {
    return apiClient.post(`/admin/chat/conversations/${firestoreId}/mark-as-read`);
};