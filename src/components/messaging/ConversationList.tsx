'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatRelativeTime, formatInitials } from '@/utils/formatters';
import type { CampaignWithDetails } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  campaigns: CampaignWithDetails[];
  activeCampaignId?: string;
  unreadCounts?: Record<string, number>;
}

export function ConversationList({ 
  campaigns, 
  activeCampaignId,
  unreadCounts = {}
}: ConversationListProps) {
  const { profile } = useAuth();

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-1 p-2">
        {campaigns.map((campaign) => {
          const isActive = campaign.id === activeCampaignId;
          const unreadCount = unreadCounts[campaign.id] || 0;
          
          const otherParty = profile?.role === 'influencer' 
            ? campaign.brand 
            : campaign.influencer;
          
          const displayName = profile?.role === 'influencer'
            ? (campaign.brand as any)?.company_name || 'Brand'
            : `${otherParty?.user?.first_name} ${otherParty?.user?.last_name}`;

          const initials = profile?.role === 'influencer'
            ? (campaign.brand as any)?.company_name?.substring(0, 2).toUpperCase() || 'BR'
            : formatInitials(
                otherParty?.user?.first_name || '',
                otherParty?.user?.last_name || ''
              );

          const imageUrl = profile?.role === 'influencer'
            ? (campaign.brand as any)?.company_logo_url
            : otherParty?.user?.profile_picture_url;

          // Get last message info if available
          const lastMessage = (campaign as any).lastMessage;

          return (
            <Link
              key={campaign.id}
              href={`/messages/${campaign.id}`}
            >
              <div
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-colors',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted/50'
                )}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={imageUrl || undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      'font-medium truncate',
                      unreadCount > 0 && 'font-semibold'
                    )}>
                      {displayName}
                    </p>
                    {lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(lastMessage.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {campaign.title}
                  </p>
                  {lastMessage && (
                    <p className={cn(
                      'text-xs truncate mt-0.5',
                      unreadCount > 0 
                        ? 'text-foreground font-medium' 
                        : 'text-muted-foreground'
                    )}>
                      {lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {campaigns.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No conversations yet
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
