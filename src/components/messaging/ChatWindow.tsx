'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { sendMessageSchema } from '@/lib/validations';
import { formatInitials, formatDateTime } from '@/utils/formatters';
import { Send, Paperclip } from 'lucide-react';
import type { MessageWithSender, SendMessageFormData } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  messages: MessageWithSender[];
  campaignId: string;
  onSendMessage: (data: SendMessageFormData) => Promise<void>;
  isSending?: boolean;
}

export function ChatWindow({ 
  messages, 
  campaignId, 
  onSendMessage, 
  isSending 
}: ChatWindowProps) {
  const { profile } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Pick<SendMessageFormData, 'content'>>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      content: '',
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSendMessage({ content: data.content, file: selectedFile || undefined });
    setSelectedFile(null);
    reset();
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, MessageWithSender[]>);

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b py-3">
        <CardTitle className="text-lg">Messages</CardTitle>
      </CardHeader>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-6">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  {new Date(date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Messages for this date */}
              <div className="space-y-4">
                {dateMessages.map((message) => {
                  const isOwnMessage = message.sender_id === profile?.id;
                  const senderName = `${message.sender?.first_name} ${message.sender?.last_name}`;
                  const initials = formatInitials(
                    message.sender?.first_name || '',
                    message.sender?.last_name || ''
                  );

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        'flex gap-3',
                        isOwnMessage && 'flex-row-reverse'
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={message.sender?.profile_picture_url || undefined} />
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          'flex flex-col max-w-[70%]',
                          isOwnMessage && 'items-end'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">
                            {isOwnMessage ? 'You' : senderName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(message.created_at)}
                          </span>
                        </div>
                        <div
                          className={cn(
                            'rounded-lg px-3 py-2 text-sm',
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          {message.content}
                          {message.file_url && (
                            <a
                              href={message.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                'block mt-2 text-xs underline',
                                isOwnMessage ? 'text-primary-foreground/80' : 'text-primary'
                              )}
                            >
                              {message.file_name ? `Attachment: ${message.file_name}` : 'View Attachment'}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              No messages yet. Start the conversation!
            </div>
          )}
        </div>
      </ScrollArea>

      <CardContent className="border-t p-3">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            className="flex-1"
            {...register('content')}
          />
          {selectedFile && (
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
              {selectedFile.name}
            </span>
          )}
          <Button type="submit" size="icon" disabled={isSending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
