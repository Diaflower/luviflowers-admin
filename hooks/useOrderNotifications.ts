import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { Order } from '@/types/types';

// import notif from '../public/notif.mp3'


export function useOrderNotifications() {
  const socket = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000');

    socket.current.on('newOrder', (order: Order) => {
      // Update the orders query cache
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Show a desktop notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Order Received', {
          body: `Order #${order.id} for ${order.customerName} has been placed.`,
        });

        // Play a notification sound
        const audio = new Audio('../public/notif.mp3');
        audio.play();
      }
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [queryClient]);
}