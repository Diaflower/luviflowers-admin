importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyB737NhSreTh8ec3SHf8ZXMQNOxylx2Uyk",
  authDomain: "dashboard-notifications-51d82.firebaseapp.com",
  projectId: "dashboard-notifications-51d82",
  storageBucket: "dashboard-notifications-51d82.appspot.com",
  messagingSenderId: "237693384419",
  appId: "1:237693384419:web:0a04c54d1d6885078637d6",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/swlogo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
