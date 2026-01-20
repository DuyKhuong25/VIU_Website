import apiClient from './api';

/**
 * Lấy danh sách các liên kết truy cập nhanh (có phân trang).
 */
export const getAllQuickAccessLinks = (page = 0, size = 10, lang = 'vi') => {
    return apiClient.get(`/quick-access?page=${page}&size=${size}&lang=${lang}`);
};

/**
 * Lấy thông tin chi tiết một liên kết.
 */
export const getQuickAccessLinkById = (id) => {
    return apiClient.get(`/quick-access/${id}`);
};

/**
 * Tạo một liên kết mới.
 */
export const createQuickAccessLink = (linkData) => {
    return apiClient.post('/quick-access', linkData);
};

/**
 * Cập nhật thông tin một liên kết.
 */
export const updateQuickAccessLink = (id, linkData) => {
    return apiClient.put(`/quick-access/${id}`, linkData);
};

/**
 * Xóa một liên kết.
 */
export const deleteQuickAccessLink = (id) => {
    return apiClient.delete(`/quick-access/${id}`);
};

/**
 * Cập nhật thứ tự của các liên kết.
 */
export const reorderQuickAccessLinks = (linkIds) => {
    return apiClient.post('/quick-access/reorder', linkIds);
};