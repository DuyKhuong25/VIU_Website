// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCUGvOSSf8i6t4mneR4vPCJvaZT-UFgnuI",
    authDomain: "viu-website-75f3e.firebaseapp.com",
    projectId: "viu-website-75f3e",
    storageBucket: "viu-website-75f3e.firebasestorage.app",
    messagingSenderId: "581609177379",
    appId: "1:581609177379:web:38836d1905b55c06228c96",
    measurementId: "G-MB5N33K7J6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Dịch vụ Firestore Database để lưu và đọc dữ liệu chat
export const db = getFirestore(app);

// Dịch vụ Authentication để xử lý đăng nhập
export const auth = getAuth(app);

export const messaging = getMessaging(app);



// Key pair for Firebase services: BP7IW-2RMy7U95Rxbksuhnw0AlSu2Enw4UUtyXjiSf9Lw8KhIc6dkqmGD4RB-jhxZUDq_maMQONvnlN5kPjQrIM