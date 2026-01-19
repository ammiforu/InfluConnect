'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  uploadMessageFile,
  subscribeToMessages,
  unsubscribeFromMessages,
} from '@/services/message.service';
import type { Message, MessageWithSender } from '@/types';

export function useMessages(campaignId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const subscriptionRef = useRef<ReturnType<typeof subscribeToMessages> | null>(null);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getMessages(campaignId);
      setMessages(result.messages);

      // Mark messages as read
      if (user) {
        await markMessagesAsRead(campaignId, user.id);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, user]);

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime messages
    subscriptionRef.current = subscribeToMessages(campaignId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage as MessageWithSender]);

      // Mark as read if not from current user
      if (user && newMessage.sender_id !== user.id) {
        markMessagesAsRead(campaignId, user.id);
      }
    });

    return () => {
      unsubscribeFromMessages(campaignId);
    };
  }, [campaignId, fetchMessages, user]);

  const send = useCallback(async (content: string, file?: File) => {
    if (!user) return;

    setIsSending(true);
    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;

      if (file) {
        const result = await uploadMessageFile(campaignId, file);
        fileUrl = result.url;
        fileName = result.name;
      }

      await sendMessage(campaignId, user.id, content, fileUrl, fileName);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsSending(false);
    }
  }, [campaignId, user]);

  return {
    messages,
    isLoading,
    isSending,
    error,
    send,
    refresh: fetchMessages,
  };
}
