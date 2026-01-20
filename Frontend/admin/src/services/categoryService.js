import apiClient from './api';

/**
 * Lấy tất cả danh mục từ API.
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getAllCategories = (page = 0, size = 5, search = '') => {
    return apiClient.get(`/categories?page=${page}&size=${size}&search=${search}`);
};

/** Lấy tất cả danh mục dưới dạng cây từ API.
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getAllCategoriesAsTree = () => {
    return apiClient.get('/categories/all-tree');
};

/**
 * Tạo mới một danh mục.
 * @param categoryData
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const createCategory = (categoryData) => {
    return apiClient.post('/categories', categoryData);
};

/** Cập nhật một danh mục.
 * @param {number} id - ID của danh mục cần cập nhật.
 * @param categoryData
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const updateCategory = (id, categoryData) => {
    return apiClient.put(`/categories/${id}`, categoryData);
};

/** Xóa một danh mục.
 * @param {number} id - ID của danh mục cần xóa.
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const deleteCategory = (id) => {
    return apiClient.delete(`/categories/${id}`);
};

/**
 * Gửi yêu cầu bật/tắt trạng thái hiển thị trên trang chủ của một danh mục.
 * @param {number} id - ID của danh mục
 * @returns {Promise<object>}
 */
export const toggleHomepageStatus = (id) => {
    return apiClient.patch(`/categories/${id}/toggle-homepage`);
};

/**
 * Gửi mảng ID danh mục đã sắp xếp lên server.
 * @param {number[]} categoryIds - Mảng các ID theo thứ tự mới.
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const reorderCategories = (categoryIds) => {
    return apiClient.post('/categories/reorder', categoryIds);
};