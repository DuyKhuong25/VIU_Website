package com.vhu.backend.service.impl;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.cloud.FirestoreClient;
import com.vhu.backend.dto.chat.request.AdminMessageRequest;
import com.vhu.backend.dto.chat.request.StartChatRequest;
import com.vhu.backend.entity.ChatConversation;
import com.vhu.backend.entity.User;
import com.vhu.backend.exception.ResourceNotFoundException;
import com.vhu.backend.repository.ChatConversationRepository;
import com.vhu.backend.repository.UserRepository;
import com.vhu.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatConversationRepository chatConversationRepository;
    private final UserRepository userRepository;

    @Override
    public String generateFirebaseToken(String userId, boolean isAdmin) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("admin", isAdmin);
        try {
            return FirebaseAuth.getInstance().createCustomToken(userId, claims);
        } catch (FirebaseAuthException e) {
            throw new RuntimeException("Lỗi khi tạo Firebase token: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public String startConversation(StartChatRequest request) {
        // Chỉ tạo nếu chưa tồn tại trong CSDL chính
        if (!chatConversationRepository.findByFirestoreConversationId(request.getFirestoreConversationId()).isPresent()) {
            // 1. Tạo bản ghi trong CSDL chính (MySQL)
            ChatConversation conversation = new ChatConversation();
            conversation.setFirestoreConversationId(request.getFirestoreConversationId());
            conversation.setStudentName(request.getStudentName());
            conversation.setStudentEmail(request.getStudentEmail());
            chatConversationRepository.save(conversation);

            // 2. Tạo document ban đầu trên Firestore
            Firestore db = FirestoreClient.getFirestore();
            Map<String, Object> data = new HashMap<>();
            data.put("studentId", request.getFirestoreConversationId());
            data.put("studentName", request.getStudentName());
            data.put("studentEmail", request.getStudentEmail());
            data.put("createdAt", com.google.cloud.Timestamp.now());
            data.put("lastMessageTimestamp", com.google.cloud.Timestamp.now());
            data.put("lastMessageText", "Cuộc trò chuyện đã bắt đầu.");
            data.put("lastMessageSenderType", null);
            data.put("hasUnreadByAdmin", false); // Ban đầu chưa có tin nhắn của sinh viên
            data.put("unreadMessageCountByAdmin", 0);

            Map<String, Object> lastReadBy = new HashMap<>();
            lastReadBy.put("student", com.google.cloud.Timestamp.now());
            lastReadBy.put("admin", null);
            data.put("lastReadBy", lastReadBy);

            db.collection("conversations").document(request.getFirestoreConversationId()).set(data);
        }

        // 3. Luôn tạo token để client có thể xác thực
        return generateFirebaseToken(request.getFirestoreConversationId(), false); // isAdmin = false
    }

    @Override
    @Transactional
    public void handleAdminMessage(String firestoreConversationId, String adminUserId, AdminMessageRequest request) {
        User admin = userRepository.findByEmail(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", adminUserId));

        Firestore db = FirestoreClient.getFirestore();

        // Nhiệm vụ duy nhất của Backend là tạo document tin nhắn mới
        Map<String, Object> messageData = new HashMap<>();
        messageData.put("senderId", String.valueOf(admin.getId()));
        messageData.put("senderType", "ADMIN");
        messageData.put("text", request.getText());
        messageData.put("timestamp", com.google.cloud.Timestamp.now());

        // Ghi tin nhắn vào sub-collection 'messages'.
        db.collection("conversations").document(firestoreConversationId)
                .collection("messages").add(messageData);

        // Cập nhật CSDL chính (MySQL) để ghi nhận admin xử lý
        chatConversationRepository.findByFirestoreConversationId(firestoreConversationId).ifPresent(conv -> {
            conv.setHandlerAdmin(admin);
            conv.setStatus("REPLIED");
            chatConversationRepository.save(conv);
        });
    }

    @Override
    @Transactional
    public void markConversationAsReadByAdmin(String firestoreConversationId) {
        Firestore db = FirestoreClient.getFirestore();
        Map<String, Object> firebaseUpdate = new HashMap<>();
        firebaseUpdate.put("hasUnreadByAdmin", false);
        firebaseUpdate.put("unreadMessageCountByAdmin", 0);
        db.collection("conversations").document(firestoreConversationId).update(firebaseUpdate);
    }

    @Override
    @Transactional
    public void deleteConversationByFirestoreId(String firestoreId) {
        chatConversationRepository.deleteByFirestoreConversationId(firestoreId);
    }
}