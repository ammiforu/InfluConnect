'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency, formatInitials } from '@/utils/formatters';
import { CAMPAIGN_STATUS_OPTIONS } from '@/utils/constants';
import { Calendar, DollarSign } from 'lucide-react';
import type { CampaignWithDetails } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface CampaignCardProps {
  campaign: CampaignWithDetails;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const { profile } = useAuth();
  
  const otherParty = profile?.role === 'influencer' 
    ? campaign.brand 
    : campaign.influencer;
  
  const otherUser = otherParty?.user;
  const displayName = profile?.role === 'influencer'
    ? (campaign.brand as any)?.company_name || 'Brand'
    : `${otherUser?.first_name} ${otherUser?.last_name}`;

  const initials = profile?.role === 'influencer'
    ? (campaign.brand as any)?.company_name?.substring(0, 2).toUpperCase() || 'BR'
    : formatInitials(otherUser?.first_name || '', otherUser?.last_name || '');

  const imageUrl = profile?.role === 'influencer'
    ? (campaign.brand as any)?.company_logo_url
    : otherUser?.profile_picture_url;

  const statusOption = CAMPAIGN_STATUS_OPTIONS.find(s => s.value === campaign.status);

  const completedDeliverables = campaign.deliverables?.filter(d => d.status === 'approved').length || 0;
  const totalDeliverables = campaign.deliverables?.length || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={imageUrl || undefined} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{campaign.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{displayName}</p>
            </div>
          </div>
          <Badge 
            variant={
              campaign.status === 'completed' ? 'success' :
              campaign.status === 'in_progress' ? 'info' :
              campaign.status === 'accepted' ? 'success' : 'secondary'
            }
          >
            {statusOption?.label || campaign.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {campaign.description}
        </p>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{campaign.progress_percentage}%</span>
          </div>
          <Progress value={campaign.progress_percentage} />
          <p className="text-xs text-muted-foreground">
            {completedDeliverables} of {totalDeliverables} deliverables completed
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{formatCurrency(campaign.budget)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Due {formatDate(campaign.deadline)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={`/campaigns/${campaign.id}`} className="w-full">
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
