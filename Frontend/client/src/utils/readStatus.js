// src/utils/readStatus.js

const READ_ANNOUNCEMENTS_KEY = 'readAnnouncements';

// Lấy danh sách ID đã đọc từ localStorage
export const getReadStatus = () => {
    try {
        const readIds = localStorage.getItem(READ_ANNOUNCEMENTS_KEY);
        return readIds ? JSON.parse(readIds) : [];
    } catch (error) {
        console.error("Lỗi khi đọc localStorage:", error);
        return [];
    }
};

// Thêm một ID mới vào danh sách đã đọc
export const markAsRead = (id) => {
    try {
        const readIds = getReadStatus();
        if (!readIds.includes(id)) {
            const newReadIds = [...readIds, id];
            localStorage.setItem(READ_ANNOUNCEMENTS_KEY, JSON.stringify(newReadIds));
        }
    } catch (error) {
        console.error("Lỗi khi ghi vào localStorage:", error);
    }
};