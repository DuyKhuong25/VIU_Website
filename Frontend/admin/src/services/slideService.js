import apiClient from './api';

export const getAllSlides = () => apiClient.get('/slides');

export const createSlide = (slideData) => apiClient.post('/slides', slideData);

export const updateSlide = (id, slideData) => apiClient.put(`/slides/${id}`, slideData);

export const deleteSlide = (id) => apiClient.delete(`/slides/${id}`);

export const toggleSlideStatus = (id) => apiClient.patch(`/slides/${id}/toggle-status`);

export const reorderSlides = (slideIds) => apiClient.post('/slides/reorder', slideIds);