/**
 * Chuyển đổi một chuỗi thành dạng "slug" (URL-friendly).
 * @param {string} str - Chuỗi đầu vào (ví dụ: "Tên chương trình").
 * @returns {string} - Chuỗi đã được slugify (ví dụ: "ten-chuong-trinh").
 */
export const slugify = (str) => {
    if (!str) return '';

    str = str.toLowerCase();
    // Bỏ dấu
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    // Xóa các ký tự đặc biệt
    str = str.replace(/[^a-z0-9\s-]/g, '');
    // Thay thế khoảng trắng bằng dấu gạch nối
    str = str.replace(/\s+/g, '-');
    // Xóa các dấu gạch nối ở đầu và cuối
    str = str.replace(/^-+|-+$/g, '');
    return str;
};