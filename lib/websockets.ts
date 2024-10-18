import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Order } from '@/types/types';

let socket: Socket | null = null;

export const useOrderWebSocket = (token: string, onNewPaidOrder: (order: Order) => void) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL as string, {
        auth: { token },
      });
    }

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('orderUpdated', (updatedOrder: Order) => {
      if (updatedOrder.status === 'PAID') {
        onNewPaidOrder(updatedOrder);
        playNotificationSound();
      }
    });

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('orderUpdated');
      }
    };
  }, [token, onNewPaidOrder]);

  return { isConnected };
};

const playNotificationSound = () => {
  const audio = new Audio('/path/to/your/notification-sound.mp3'); // Replace with your actual sound file path
  audio.play();
};

export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission !== 'denied') {
    await Notification.requestPermission();
  }
};