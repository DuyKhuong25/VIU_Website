package com.vhu.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_conversations")
@Data
public class ChatConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "firestore_conversation_id", nullable = false, unique = true)
    private String firestoreConversationId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "student_email", nullable = false)
    private String studentEmail;

    @Column(nullable = false)
    private String status = "OPEN";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handler_admin_id")
    private User handlerAdmin;

    @Column(name = "has_unread_by_admin", nullable = false)
    @ColumnDefault("false")
    private boolean hasUnreadByAdmin = false;

    @Column(name = "unread_message_count_by_admin", nullable = false)
    @ColumnDefault("0")
    private int unreadMessageCountByAdmin = 0;

    @Column(name = "last_message_text", columnDefinition = "TEXT")
    private String lastMessageText;

    @Column(name = "last_message_sender_type", length = 50)
    private String lastMessageSenderType;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}