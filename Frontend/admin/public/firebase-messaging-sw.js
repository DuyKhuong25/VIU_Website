// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCUGvOSSf8i6t4mneR4vPCJvaZT-UFgnuI",
    authDomain: "viu-website-75f3e.firebaseapp.com",
    projectId: "viu-website-75f3e",
    storageBucket: "viu-website-75f3e.firebasestorage.app",
    messagingSenderId: "581609177379",
    appId: "1:581609177379:web:38836d1905b55c06228c96",
    measurementId: "G-MB5N33K7J6"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

const broadcast = new BroadcastChannel('notifications-channel');

// Xử lý khi nhận thông báo ở chế độ nền
messaging.onBackgroundMessage((payload) => {
    console.log(
        "[firebase-messaging-sw.js] Received background message ",
        payload
    );

    broadcast.postMessage({ type: 'NEW_NOTIFICATION_RECEIVED' });

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: "/firebase-logo.png",
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});