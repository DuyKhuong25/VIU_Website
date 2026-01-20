package com.vhu.backend.repository;

import com.vhu.backend.entity.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {

    Optional<ChatConversation> findByFirestoreConversationId(String firestoreConversationId);

    void deleteByFirestoreConversationId(String firestoreId);
}