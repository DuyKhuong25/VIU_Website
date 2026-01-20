package com.vhu.backend.service;

import com.vhu.backend.dto.chat.request.AdminMessageRequest;
import com.vhu.backend.dto.chat.request.StartChatRequest;

public interface ChatService {
    String generateFirebaseToken(String userId, boolean isAdmin);

    String startConversation(StartChatRequest request);

    void handleAdminMessage(String firestoreConversationId, String adminUserId, AdminMessageRequest request);

    void markConversationAsReadByAdmin(String firestoreConversationId);

    void deleteConversationByFirestoreId(String firestoreId);
}