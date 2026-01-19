'use client';

import { useCampaigns } from '@/hooks/useCampaigns';
import { useAuth } from '@/context/AuthContext';
import { CampaignCard } from '@/components/campaign/CampaignCard';
import { Loading } from '@/components/ui/loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CampaignsPage() {
  const { profile } = useAuth();
  const { campaigns, isLoading } = useCampaigns();

  const activeCampaigns = campaigns.filter(c => 
    c.status === 'in_progress' || c.status === 'accepted'
  );
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');
  const allCampaigns = campaigns;

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
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <p className="text-muted-foreground mt-1">
          Manage your active and past collaborations
        </p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeCampaigns.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedCampaigns.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({allCampaigns.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeCampaigns.length === 0 ? (
            <EmptyState message="No active campaigns" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedCampaigns.length === 0 ? (
            <EmptyState message="No completed campaigns" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {allCampaigns.length === 0 ? (
            <EmptyState message="No campaigns yet" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 border rounded-lg bg-muted/50">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
