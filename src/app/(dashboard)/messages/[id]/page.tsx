'use client';

import { useParams } from 'next/navigation';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ChatWindow } from '@/components/messaging/ChatWindow';
import { Loading } from '@/components/ui/loading';
import type { SendMessageFormData } from '@/types';

export default function ConversationPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const { profile } = useAuth();
  const toast = useToast();
  
  const { campaigns, isLoading: campaignsLoading } = useCampaigns();
  const { 
    messages, 
    isLoading: messagesLoading, 
    send,
    isSending 
  } = useMessages(campaignId);

  const conversationCampaigns = campaigns.filter(c => 
    c.status === 'in_progress' || c.status === 'accepted' || c.status === 'completed'
  );

  const handleSendMessage = async (data: SendMessageFormData) => {
    try {
      await send(data.content, data.file);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (campaignsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Communicate with your collaboration partners
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversation List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <ConversationList 
            campaigns={conversationCampaigns} 
            activeCampaignId={campaignId}
          />
        </Card>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          <ChatWindow
            messages={messages}
            campaignId={campaignId}
            onSendMessage={handleSendMessage}
            isSending={isSending}
          />
        </div>
      </div>
    </div>
  );
}
