package com.vhu.backend.utils;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public final class SlugUtil {

    private SlugUtil() {}

    /**
     * @param input Chuỗi cần chuyển đổi.
     * @return Chuỗi đã được chuyển đổi thành slug.
     */
    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        // 1. Chuyển chuỗi về chữ thường và xử lý riêng ký tự 'đ'
        String normalized = input.toLowerCase(Locale.ROOT);
        normalized = normalized.replace('đ', 'd');

        // 2. Chuẩn hóa Unicode (NFD) để tách các ký tự có dấu
        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD);

        // 3. Dùng regex để loại bỏ các dấu đã được tách ra
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        normalized = pattern.matcher(normalized).replaceAll("");

        // 4. Thay thế các ký tự không phải chữ hoặc số bằng dấu gạch ngang
        normalized = normalized.replaceAll("[^a-z0-9]+", "-");

        // 5. Dọn dẹp các dấu gạch ngang thừa (nếu có)
        normalized = normalized.replaceAll("-{2,}", "-");
        normalized = normalized.replaceAll("^-|-$", "");

        return normalized;
    }
}