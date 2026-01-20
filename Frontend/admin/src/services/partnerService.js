import apiClient from './api';

/**
 * Lấy danh sách đối tác (lấy tất cả, sắp xếp theo displayOrder).
 */
export const getAllPartners = (lang = 'vi') => {
    // Lấy tối đa 100 items, sắp xếp theo thứ tự
    return apiClient.get(`/admin/partners?page=0&size=100&sort=displayOrder,asc&lang=${lang}`);
};

/**
 * Lấy thông tin chi tiết một đối tác (bao gồm đủ các bản dịch).
 */
export const getPartnerById = (id) => {
    return apiClient.get(`/admin/partners/${id}`);
};

/**
 * Tạo một đối tác mới.
 */
export const createPartner = (partnerData) => {
    return apiClient.post('/admin/partners', partnerData);
};

/**
 * Cập nhật thông tin một đối tác.
 */
export const updatePartner = (id, partnerData) => {
    return apiClient.put(`/admin/partners/${id}`, partnerData);
};

/**
 * Xóa một đối tác.
 */
export const deletePartner = (id) => {
    return apiClient.delete(`/admin/partners/${id}`);
};

/**
 * Cập nhật thứ tự của các đối tác sau khi kéo thả.
 */
export const reorderPartners = (partnerIds) => {
    return apiClient.post('/admin/partners/reorder', partnerIds);
};