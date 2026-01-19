'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency, formatInitials } from '@/utils/formatters';
import type { CampaignWithDetails } from '@/types';
import { ArrowRight } from 'lucide-react';

interface ActiveCampaignsProps {
  campaigns: CampaignWithDetails[];
  userRole: 'influencer' | 'brand';
}

export function ActiveCampaigns({ campaigns, userRole }: ActiveCampaignsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Active Campaigns</CardTitle>
        <Link href="/campaigns">
          <Button variant="ghost" size="sm">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.slice(0, 5).map((campaign) => {
            const otherParty = userRole === 'influencer' 
              ? campaign.brand 
              : campaign.influencer;
            
            const displayName = userRole === 'influencer'
              ? (campaign.brand as any)?.company_name || 'Brand'
              : `${otherParty?.user?.first_name} ${otherParty?.user?.last_name}`;

            const initials = userRole === 'influencer'
              ? (campaign.brand as any)?.company_name?.substring(0, 2).toUpperCase() || 'BR'
              : formatInitials(
                  otherParty?.user?.first_name || '',
                  otherParty?.user?.last_name || ''
                );

            const imageUrl = userRole === 'influencer'
              ? (campaign.brand as any)?.company_logo_url
              : otherParty?.user?.profile_picture_url;

            return (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="block"
              >
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={imageUrl || undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{campaign.title}</p>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(campaign.budget)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {displayName}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress 
                        value={campaign.progress_percentage} 
                        className="flex-1 h-2" 
                      />
                      <span className="text-xs font-medium">
                        {campaign.progress_percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {campaigns.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No active campaigns
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
