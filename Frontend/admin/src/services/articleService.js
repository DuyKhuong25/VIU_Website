import apiClient from './api';
export const getAllArticles = (page = 0, size = 10, search = '') => {
    return apiClient.get(`/articles?page=${page}&size=${size}&search=${search}`);
};

export const getArticleById = (id) => apiClient.get(`/articles/id/${id}`);

export const createArticle = (articleData) => apiClient.post('/articles', articleData);

export const updateArticle = (id, articleData) => apiClient.put(`/articles/${id}`, articleData);

export const deleteArticle = (id) => apiClient.delete(`/articles/${id}`);

export const getAllArticleTitles = () => apiClient.get('/articles/list-titles');

export const toggleArticlePinStatus = (id) => {
    return apiClient.patch(`/articles/${id}/toggle-pin`);
};