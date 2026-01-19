'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useStats } from '@/hooks/useStats';
import { useCampaigns } from '@/hooks/useCampaigns';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActiveCampaigns } from '@/components/dashboard/ActiveCampaigns';
import { Loading } from '@/components/ui/loading';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp,
  Send,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { stats, isLoading: statsLoading } = useStats();
  const { campaigns, isLoading: campaignsLoading } = useCampaigns();

  const isInfluencer = profile?.role === 'influencer';
  const activeCampaigns = campaigns?.filter(c => 
    c.status === 'in_progress' || c.status === 'accepted'
  ) || [];

  if (statsLoading || campaignsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.first_name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your {isInfluencer ? 'collaborations' : 'campaigns'}
        </p>
      </div>

      {/* Stats Grid */}
      {isInfluencer ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Requests"
            value={stats?.pendingRequests || 0}
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Active Campaigns"
            value={stats?.activeCampaigns || 0}
            icon={Briefcase}
          />
          <StatCard
            title="Total Earnings"
            value={formatCurrency(stats?.totalEarnings || 0)}
            icon={DollarSign}
            variant="success"
          />
          <StatCard
            title="Average Rating"
            value={stats?.averageRating?.toFixed(1) || 'N/A'}
            icon={Star}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Sent Requests"
            value={stats?.pendingRequests || 0}
            icon={Send}
          />
          <StatCard
            title="Active Campaigns"
            value={stats?.activeCampaigns || 0}
            icon={Briefcase}
          />
          <StatCard
            title="Total Spent"
            value={formatCurrency(stats?.totalSpent || 0)}
            icon={DollarSign}
          />
          <StatCard
            title="Completed"
            value={stats?.completedCampaigns || 0}
            icon={CheckCircle}
            variant="success"
          />
        </div>
      )}

      {/* Active Campaigns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActiveCampaigns 
          campaigns={activeCampaigns} 
          userRole={profile?.role as 'influencer' | 'brand'} 
        />
        
        {/* Quick Actions or Recent Activity could go here */}
        <div className="space-y-6">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {isInfluencer ? (
                <>
                  <QuickActionLink href="/requests" label="View pending requests" />
                  <QuickActionLink href="/profile" label="Update your profile" />
                  <QuickActionLink href="/campaigns" label="Check campaign progress" />
                </>
              ) : (
                <>
                  <QuickActionLink href="/discover" label="Find influencers" />
                  <QuickActionLink href="/requests" label="Track sent requests" />
                  <QuickActionLink href="/campaigns" label="Manage campaigns" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
    >
      <span className="text-sm">{label}</span>
      <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}
