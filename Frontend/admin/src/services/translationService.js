// Gọi API dịch thuật.
import apiClient from './api';

/**
 * Gửi yêu cầu dịch một hoặc nhiều trường văn bản.
 * @param {object} texts - Object chứa các text cần dịch, ví dụ: { name: "Tên danh mục" }
 * @returns {Promise<object>}
 */
export const translateTexts = (texts) => {
    return apiClient.post('/translate', { texts });
};