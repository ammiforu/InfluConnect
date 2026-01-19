'use client';

import { useParams } from 'next/navigation';
import { useCampaigns, useDeliverables } from '@/hooks/useCampaigns';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliverablesList } from '@/components/campaign/DeliverablesList';
import { ChatWindow } from '@/components/messaging/ChatWindow';
import { Loading } from '@/components/ui/loading';
import { formatDate, formatCurrency, formatInitials } from '@/utils/formatters';
import { CAMPAIGN_STATUS_OPTIONS } from '@/utils/constants';
import { Calendar, DollarSign } from 'lucide-react';
import type { SendMessageFormData } from '@/types';

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const { profile } = useAuth();
  const toast = useToast();
  
  const { 
    campaigns, 
    isLoading: campaignsLoading,
  } = useCampaigns();

  const {
    deliverables,
    isLoading: deliverablesLoading,
    submit,
    approve,
    reject,
  } = useDeliverables(campaignId);
  
  const { 
    messages, 
    isLoading: messagesLoading, 
    send,
    isSending 
  } = useMessages(campaignId);

  const campaign = campaigns.find(c => c.id === campaignId);

  if (campaignsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Campaign not found</h2>
        <p className="text-muted-foreground mt-2">
          The campaign you're looking for doesn't exist or you don't have access.
        </p>
      </div>
    );
  }

  const isInfluencer = profile?.role === 'influencer';
  const otherParty = isInfluencer ? campaign.brand : campaign.influencer;
  
  const displayName = isInfluencer
    ? (campaign.brand as any)?.company_name || 'Brand'
    : `${otherParty?.user?.first_name} ${otherParty?.user?.last_name}`;

  const initials = isInfluencer
    ? (campaign.brand as any)?.company_name?.substring(0, 2).toUpperCase() || 'BR'
    : formatInitials(otherParty?.user?.first_name || '', otherParty?.user?.last_name || '');

  const imageUrl = isInfluencer
    ? (campaign.brand as any)?.company_logo_url
    : otherParty?.user?.profile_picture_url;

  const statusOption = CAMPAIGN_STATUS_OPTIONS.find(s => s.value === campaign.status);

  const handleSendMessage = async (data: SendMessageFormData) => {
    try {
      await send(data.content, data.file);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleSubmitDeliverable = async (id: string, url: string, notes?: string) => {
    try {
      await submit(id, url, notes);
      toast.success('Deliverable submitted successfully');
    } catch (error) {
      toast.error('Failed to submit deliverable');
    }
  };

  const handleApproveDeliverable = async (id: string) => {
    try {
      await approve(id);
      toast.success('Deliverable approved');
    } catch (error) {
      toast.error('Failed to approve deliverable');
    }
  };

  const handleRejectDeliverable = async (id: string, reason: string) => {
    try {
      await reject(id, reason);
      toast.success('Revision requested');
    } catch (error) {
      toast.error('Failed to reject deliverable');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={imageUrl || undefined} />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{campaign.title}</h1>
            <p className="text-muted-foreground">{displayName}</p>
          </div>
        </div>
        <Badge
          variant={
            campaign.status === 'completed' ? 'success' :
            campaign.status === 'in_progress' ? 'info' : 'secondary'
          }
          className="text-sm"
        >
          {statusOption?.label || campaign.status}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {formatCurrency(campaign.budget)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Deadline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {formatDate(campaign.deadline)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <span className="text-2xl font-bold">
                {campaign.progress_percentage}%
              </span>
              <Progress value={campaign.progress_percentage} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="deliverables">
        <TabsList>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="deliverables" className="mt-6">
          <DeliverablesList
            deliverables={deliverables || campaign.deliverables || []}
            onSubmit={handleSubmitDeliverable}
            onApprove={handleApproveDeliverable}
            onReject={handleRejectDeliverable}
          />
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <ChatWindow
            messages={messages}
            campaignId={campaignId}
            onSendMessage={handleSendMessage}
            isSending={isSending}
          />
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-muted-foreground">{campaign.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-1">Start Date</h4>
                  <p className="text-muted-foreground">
                    {formatDate(campaign.start_date)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">End Date</h4>
                  <p className="text-muted-foreground">
                    {formatDate(campaign.deadline)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
