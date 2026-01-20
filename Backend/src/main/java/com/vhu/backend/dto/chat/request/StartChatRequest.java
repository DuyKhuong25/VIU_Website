package com.vhu.backend.dto.chat.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StartChatRequest {
    @NotBlank
    private String firestoreConversationId;

    @NotBlank
    private String studentName;

    @NotBlank
    @Email
    private String studentEmail;
}