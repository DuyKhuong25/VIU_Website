package com.vhu.backend.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@AllArgsConstructor
public class FirebaseMessagingService {

    private final FirebaseMessaging firebaseMessaging;
    private static final Logger logger = LoggerFactory.getLogger(FirebaseMessagingService.class);

    public void sendNotification(String title, String body, String topic) {
//        System.out.println("!!! DEBUG: Đang cố gắng gửi thông báo đến topic: " + topic);
        Notification notification = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        Message message = Message.builder()
                .setTopic(topic)
                .setNotification(notification)
                .putData("type", "NEW_NOTIFICATION")
                .build();
        try {
            String response = firebaseMessaging.send(message);
            logger.info("Successfully sent message: " + response);
        } catch (FirebaseMessagingException e) {
            logger.error("Failed to send Firebase message", e);
        }
    }

    public void subscribeToTopic(String token, String topic) {
        try {
            FirebaseMessaging.getInstance().subscribeToTopic(Collections.singletonList(token), topic);
//            System.out.println("!!! SUCCESS: Đã đăng ký token " + token + " vào topic " + topic);
        } catch (FirebaseMessagingException e) {
            System.out.println("!!! ERROR: Lỗi khi đăng ký topic: " + e.getMessage());
        }
    }
}