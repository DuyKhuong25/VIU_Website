package com.vhu.backend.service;

import com.google.cloud.translate.v3.LocationName;
import com.google.cloud.translate.v3.TranslateTextRequest;
import com.google.cloud.translate.v3.TranslateTextResponse;
import com.google.cloud.translate.v3.TranslationServiceClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TranslationService {

    @Value("${gcp.project-id}")
    private String projectId;

    /**
     * Dịch một Map các cặp key-text từ Tiếng Việt sang Tiếng Anh.
     * @param textsToTranslate Map chứa các trường cần dịch.
     * @return Map chứa các trường đã được dịch.
     */
    public Map<String, String> translateToEnglish(Map<String, String> textsToTranslate) {
        if (textsToTranslate == null || textsToTranslate.isEmpty()) {
            return new HashMap<>();
        }

        // Tách keys và values ra 2 danh sách riêng biệt nhưng cùng thứ tự
        List<String> keys = new ArrayList<>(textsToTranslate.keySet());
        List<String> values = new ArrayList<>(textsToTranslate.values());

        try (TranslationServiceClient client = TranslationServiceClient.create()) {
            LocationName parent = LocationName.of(projectId, "global");

            TranslateTextRequest request =
                    TranslateTextRequest.newBuilder()
                            .setParent(parent.toString())
                            .setMimeType("text/html")
                            .setSourceLanguageCode("vi")
                            .setTargetLanguageCode("en")
                            .addAllContents(values)
                            .build();

            TranslateTextResponse response = client.translateText(request);

            // Gộp lại keys ban đầu và các giá trị đã được dịch
            Map<String, String> translatedTexts = new HashMap<>();
            for (int i = 0; i < response.getTranslationsCount(); i++) {
                String originalKey = keys.get(i);
                String translatedText = response.getTranslations(i).getTranslatedText();
                translatedTexts.put(originalKey, translatedText);
            }
            return translatedTexts;

        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi gọi API dịch thuật của Google Cloud", e);
        }
    }
}