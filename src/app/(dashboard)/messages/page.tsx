'use client';

import { useCampaigns } from '@/hooks/useCampaigns';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ConversationList } from '@/components/messaging/ConversationList';
import { Loading } from '@/components/ui/loading';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  const { profile } = useAuth();
  const { campaigns, isLoading } = useCampaigns();

  // Only show campaigns with messages (active or completed)
  const conversationCampaigns = campaigns.filter(c => 
    c.status === 'in_progress' || c.status === 'accepted' || c.status === 'completed'
  );

  if (isLoading) {
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
          <ConversationList campaigns={conversationCampaigns} />
        </Card>

        {/* Empty State for Messages */}
        <Card className="lg:col-span-2 flex items-center justify-center min-h-[600px]">
          <div className="text-center p-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Select a conversation</h3>
            <p className="text-muted-foreground text-sm">
              Choose a campaign from the list to start messaging
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
