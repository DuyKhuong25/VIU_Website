package com.vhu.backend.dto.chat.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatConversationResponse {
    private Long id;
    private String firestoreConversationId;
    private String studentName;
    private String studentEmail;
    private String status;
    private String handlerAdminName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}