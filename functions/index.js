const functions = require("firebase-functions");

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const { onCall } = require("firebase-functions/v2/https");

const admin = require('firebase-admin');
const axios = require('axios');
admin.initializeApp();
const db = admin.firestore();

exports.onMessageCreate = onDocumentCreated({
    document: "conversations/{conversationId}/messages/{messageId}",
    region: "asia-southeast1"
}, async (event) => {
    const snap = event.data;
    if (!snap) {
        logger.log("Không có dữ liệu, thoát function.");
        return;
    }

    const messageData = snap.data();
    const conversationId = event.params.conversationId;
    const convDocRef = db.collection('conversations').doc(conversationId);

    logger.log(`Tin nhắn mới trong ${conversationId}. Dữ liệu:`, messageData);

    // --- Logic khi SINH VIÊN gửi tin nhắn ---
    if (messageData.senderType === 'STUDENT') {
        logger.log(`Phát hiện tin nhắn từ STUDENT. Cập nhật conversation: ${conversationId}`);
        return db.runTransaction(async (transaction) => {
            const convDoc = await transaction.get(convDocRef);
            if (!convDoc.exists) {
                logger.error(`Document conversation ${conversationId} không tồn tại!`);
                return;
            }

            const currentUnreadCount = convDoc.data().unreadMessageCountByAdmin || 0;
            const newUnreadCount = currentUnreadCount + 1;

            transaction.update(convDocRef, {
                lastMessageText: messageData.text,
                lastMessageTimestamp: messageData.timestamp,
                lastMessageSenderType: 'STUDENT',
                hasUnreadByAdmin: true,
                unreadMessageCountByAdmin: newUnreadCount
            });
        });
    }
    // --- Logic khi ADMIN gửi tin nhắn ---
    else if (messageData.senderType === 'ADMIN') {
        logger.log(`Phát hiện tin nhắn từ ADMIN. Cập nhật conversation: ${conversationId}`);
        return convDocRef.update({
            lastMessageText: messageData.text,
            lastMessageTimestamp: messageData.timestamp,
            lastMessageSenderType: 'ADMIN',
            hasUnreadByAdmin: false,
            unreadMessageCountByAdmin: 0
        });
    }

    logger.warn(`Không xác định được senderType: ${messageData.senderType} trong tin nhắn.`);
    return null;
});

/**
 * Trigger này chạy tự động mỗi ngày để dọn dẹp các cuộc trò chuyện cũ.
 */
exports.cleanupInactiveConversations = onSchedule("every day 15:00",{
    schedule: "every day 15:00",
    timeZone: "Asia/Ho_Chi_Minh",
    region: "asia-southeast1"
}, async (event) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoTimestamp = admin.firestore.Timestamp.fromDate(sevenDaysAgo);

    logger.log("Bắt đầu quét các cuộc trò chuyện cũ hơn ngày:", sevenDaysAgo.toISOString());

    const inactiveConversationsQuery = db.collection('conversations')
        .where('lastMessageTimestamp', '<', sevenDaysAgoTimestamp);

    const snapshot = await inactiveConversationsQuery.get();
    if (snapshot.empty) {
        logger.log("Không có cuộc trò chuyện nào cần xóa.");
        return null;
    }
        const promises = [];
        snapshot.forEach(doc => {
            const firestoreId = doc.id;
            console.log(`Lên lịch xóa cho cuộc trò chuyện: ${firestoreId}`);

            // Bước 1: Xóa sub-collection 'messages' trên Firebase
            const deleteFirebaseData = deleteCollection(db, `conversations/${firestoreId}/messages`, 100)
                .then(() => {
                    // Bước 2: Xóa document 'conversation' cha trên Firebase
                    console.log(`Đã xóa tin nhắn trong ${firestoreId}. Đang xóa document cha...`);
                    return doc.ref.delete();
                });

            // Bước 3: Sau khi xóa trên Firebase, gọi API để xóa trên CSDL chính
            const deleteBackendData = deleteFirebaseData.then(() => {
                const projectId = 'viu-website-75f3e';
                const isProduction = projectId === 'viu-website-75f3e';
                const baseUrl = "https://aiotlab.viu.edu.vn/api/";

                if (!baseUrl) {
                    console.error(`URL backend chưa được cấu hình, không thể xóa bản ghi SQL cho ${firestoreId}`);
                    return null;
                }

                const backendUrl = `${baseUrl}/api/internal/chat/conversations/${firestoreId}`;
                console.log(`Đang gọi Backend để xóa bản ghi SQL: ${backendUrl}`);
                return axios.delete(backendUrl);
            });

            promises.push(deleteBackendData);
        });

        await Promise.all(promises);
        console.log(`Hoàn tất! Đã xóa thành công ${snapshot.size} cuộc trò chuyện và các bản ghi liên quan.`);
        return null;
    });

exports.deleteConversation = onCall({
    region: "asia-southeast1"
}, async (data, context) => {

    logger.log(">>> [HÀM XÓA] ĐÃ ĐƯỢC GỌI <<<");
    logger.log(">>> [DATA]", data);
    logger.log(">>> [AUTH CONTEXT]", context.auth);
    if(context.auth) {
        logger.log(">>> [AUTH TOKEN CLAIMS]", context.auth.token);
    }

    // if (!context.auth || context.auth.token.admin !== true) {
    //     logger.error("Yêu cầu xóa bị từ chối. Người dùng không phải Admin.");
    //     throw new functions.https.HttpsError('permission-denied', 'Bạn phải là Admin để thực hiện hành động này.');
    // }

    const firestoreId = data.firestoreId;
    if (!firestoreId) {
        logger.error("Yêu cầu xóa thất bại. Thiếu 'firestoreId'.");
        throw new functions.https.HttpsError('invalid-argument', 'Thiếu ' + firestoreId +'.');
    }

    logger.log(`Admin ${context.auth.uid} đang yêu cầu xóa cuộc trò chuyện: ${firestoreId}`);

    try {
        // 2. Logic xóa Firebase
        await deleteCollection(db, `conversations/${firestoreId}/messages`, 100);
        logger.log(`Đã xóa messages trong ${firestoreId}. Đang xóa document cha...`);

        await db.collection('conversations').doc(firestoreId).delete();
        logger.log(`Đã xóa document cha ${firestoreId}.`);

        // 3. Logic gọi API xóa SQL
        const projectId = 'viu-website-75f3e';
        const isProduction = projectId === 'viu-website-75f3e';
        const baseUrl = "https://aiotlab.viu.edu.vn/api/";

        if (!baseUrl) {
            logger.error(`URL backend chưa được cấu hình, không thể xóa SQL cho ${firestoreId}`);
            throw new functions.https.HttpsError('internal', 'Lỗi cấu hình server.');
        }

        const backendUrl = `${baseUrl}/api/internal/chat/conversations/${firestoreId}`;
        logger.log(`Đang gọi Backend để xóa SQL: ${backendUrl}`);

        await axios.delete(backendUrl);

        logger.log(`ĐÃ XÓA HOÀN TẤT: ${firestoreId}`);
        return { success: true, firestoreId: firestoreId };

    } catch (error) {
        logger.error(`Lỗi nghiêm trọng khi xóa ${firestoreId}:`, error);
        throw new functions.https.HttpsError('internal', 'Đã xảy ra lỗi khi xóa cuộc trò chuyện.');
    }
});

/**
 * Hàm tiện ích để xóa một collection và tất cả các document bên trong nó theo batch.
 */
async function deleteCollection(db, collectionPath, batchSize) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
        return resolve();
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}