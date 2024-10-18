'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import api from '@/lib/api';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export default function NotificationHandler() {
  const router = useRouter();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const app = initializeApp(firebaseConfig);
      const messaging = getMessaging(app);

      const registerServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registered with scope:', registration.scope);
          } catch (error) {
            console.error('Service Worker registration failed:', error);
          }
        }
      };

      const setupFCM = async () => {
        try {
          const permission = await Notification.requestPermission();
          console.log("Notification permission:", permission);
          setNotificationPermission(permission);

          if (permission === 'granted') {
            const token = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY });
            if (token) {
              console.log('FCM token:', token);
              try {
                await api.post('/notifications/subscribe', { token, topic: 'new_orders' });
                console.log('Subscribed to new_orders topic');
              } catch (error) {
                console.error('Failed to subscribe to topic:', error);
              }
            } else {
              console.log('No registration token available. Request permission to generate one.');
            }
          }
        } catch (error) {
          console.error('Error setting up FCM:', error);
        }
      };

      const handleForegroundMessage = (payload: any) => {
        console.log('Foreground message received:', payload);
        
        // Play a notification sound
        const audio = new Audio('/notification.mp3');
        audio.play();

        // Show notification if we're not on the orders page
        if (!window.location.pathname.includes('/orders')) {
          new Notification(payload.notification?.title || 'New Notification', {
            body: payload.notification?.body,
            icon: '/path/to/icon.png'
          });
        }

        // Refresh the page if we're on the orders page
        if (window.location.pathname.includes('/orders')) {
          router.refresh();
        }
      };

      const handleBackgroundMessage = (event: MessageEvent) => {
        console.log('Received message from service worker:', event.data);
        if (event.data.type === 'NOTIFICATION_CLICK') {
          // Handle notification click, e.g., navigate to a specific page
          router.push('/orders');
        }
      };

      registerServiceWorker();
      setupFCM();

      // Handle foreground messages
      const unsubscribeForeground = onMessage(messaging, handleForegroundMessage);

      // Handle background messages
      navigator.serviceWorker.addEventListener('message', handleBackgroundMessage);

      return () => {
        unsubscribeForeground();
        navigator.serviceWorker.removeEventListener('message', handleBackgroundMessage);
      };
    }
  }, [router]);

  return (
    <>
      {notificationPermission === 'denied' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Notifications are disabled. </strong>
          <span className="block sm:inline">
            To receive important order updates, please enable notifications for this site in your browser settings.
          </span>
          <a 
            href="https://support.google.com/chrome/answer/3220216?hl=en" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline ml-1"
          >
            Learn how to enable notifications
          </a>
        </div>
      )}
    </>
  );
}