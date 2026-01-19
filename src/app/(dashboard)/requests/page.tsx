'use client';

import { useRequests, useRequestActions } from '@/hooks/useRequests';
import { useAuth } from '@/context/AuthContext';
import { RequestCard } from '@/components/campaign/RequestCard';
import { Loading } from '@/components/ui/loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/context/ToastContext';

export default function RequestsPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const { 
    requests, 
    isLoading,
    refresh,
  } = useRequests();
  const { accept, reject } = useRequestActions();

  const isInfluencer = profile?.role === 'influencer';

  const pendingRequests = requests.filter(r => r.status === 'requested');
  const acceptedRequests = requests.filter(r => r.status === 'accepted');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  const handleAccept = async (id: string) => {
    try {
      await accept(id);
      await refresh();
      toast.success('Request accepted! Campaign created.');
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reject(id);
      await refresh();
      toast.success('Request rejected');
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

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
        <h1 className="text-3xl font-bold">
          {isInfluencer ? 'Collaboration Requests' : 'Sent Requests'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isInfluencer 
            ? 'Review and respond to collaboration requests from brands'
            : 'Track the status of your collaboration requests'
          }
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({acceptedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingRequests.length === 0 ? (
            <EmptyState message="No pending requests" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {pendingRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          {acceptedRequests.length === 0 ? (
            <EmptyState message="No accepted requests" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {acceptedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedRequests.length === 0 ? (
            <EmptyState message="No rejected requests" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {rejectedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
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
