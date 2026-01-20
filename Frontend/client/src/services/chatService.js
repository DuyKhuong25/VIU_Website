import apiClient from './api';

/**
 * Sinh viên bắt đầu một cuộc trò chuyện mới.
 * Backend sẽ trả về một Firebase Custom Token.
 * @param {object} studentInfo - { firestoreConversationId, studentName, studentEmail }
 * @returns {Promise<object>}
 */
export const startStudentChat = (studentInfo) => {
    return apiClient.post('/public/chat/start', studentInfo);
};