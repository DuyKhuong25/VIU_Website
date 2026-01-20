import apiClient from './api';

/**
 * Lấy danh sách thẻ có phân trang và tìm kiếm.
 * @param {number} page - Số trang
 * @param {number} size - Số lượng trên mỗi trang
 * @param {string} search - Từ khóa tìm kiếm
 * @returns {Promise<object>}
 */
export const getAllTags = (page = 0, size = 10, search = '') => {
    return apiClient.get(`/tags?page=${page}&size=${size}&search=${search}`);
};

/**
 * Tạo một thẻ mới.
 * @param {object} tagData - Dữ liệu thẻ từ form.
 * @returns {Promise<object>}
 */
export const createTag = (tagData) => {
    return apiClient.post('/tags', tagData);
};

/**
 * Cập nhật một thẻ.
 * @param {number} id - ID của thẻ.
 * @param {object} tagData - Dữ liệu cập nhật.
 * @returns {Promise<object>}
 */
export const updateTag = (id, tagData) => {
    return apiClient.put(`/tags/${id}`, tagData);
};

/**
 * Xóa một thẻ.
 * @param {number} id - ID của thẻ.
 * @returns {Promise<object>}
 */
export const deleteTag = (id) => {
    return apiClient.delete(`/tags/${id}`);
};