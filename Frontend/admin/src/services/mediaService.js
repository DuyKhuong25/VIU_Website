import apiClient from './api';

export const uploadFile = (file, folder = 'others') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    return apiClient.post('/media/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};