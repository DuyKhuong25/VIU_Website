import apiClient from './api';

// --- API cho Chương trình đào tạo ---
export const getAllProgramLevels = (lang = 'vi') => {
    return apiClient.get(`/program-levels?lang=${lang}`);
};
export const getProgramLevelById = (id) => {
    return apiClient.get(`/program-levels/${id}`);
};
export const createProgramLevel = (data) => {
    return apiClient.post('/program-levels', data);
};
export const updateProgramLevel = (id, data) => {
    return apiClient.put(`/program-levels/${id}`, data);
};
export const deleteProgramLevel = (id) => {
    return apiClient.delete(`/program-levels/${id}`);
};

// --- API cho Ngành đào tạo ---
export const getAllMajors = (page = 0, size = 10, lang = 'vi') => {
    return apiClient.get(`/majors?page=${page}&size=${size}&lang=${lang}`);
};
export const getMajorById = (id) => {
    return apiClient.get(`/majors/${id}`);
};
export const createMajor = (data) => {
    return apiClient.post('/majors', data);
};
export const updateMajor = (id, data) => {
    return apiClient.put(`/majors/${id}`, data);
};
export const deleteMajor = (id) => {
    return apiClient.delete(`/majors/${id}`);
};