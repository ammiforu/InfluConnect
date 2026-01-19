'use client';

import Link from 'next/link';
import { Instagram, Youtube, Music2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatNumber, formatInitials, formatCurrency } from '@/utils/formatters';
import { NICHE_OPTIONS } from '@/utils/constants';
import type { InfluencerWithProfile } from '@/types';

interface InfluencerCardProps {
  influencer: InfluencerWithProfile;
  onRequestClick?: (id: string) => void;
}

export function InfluencerCard({ influencer, onRequestClick }: InfluencerCardProps) {
  const user = influencer.user;
  const fullName = `${user.first_name} ${user.last_name}`;
  const initials = formatInitials(user.first_name, user.last_name);
  
  const nicheLabel = NICHE_OPTIONS.find(n => n.value === influencer.niche)?.label || influencer.niche;

  // Get total followers
  const totalFollowers = (influencer.instagram_followers || 0) + 
    (influencer.tiktok_followers || 0) + 
    (influencer.youtube_subscribers || 0);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.profile_picture_url || undefined} alt={fullName} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link 
                  href={`/influencers/${influencer.id}`}
                  className="font-semibold text-lg hover:text-primary transition-colors"
                >
                  {fullName}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{nicheLabel}</Badge>
                  <Badge variant={influencer.is_available ? 'success' : 'secondary'}>
                    {influencer.is_available ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
              </div>
            </div>

            {influencer.bio && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {influencer.bio}
              </p>
            )}

            {/* Social stats */}
            <div className="flex items-center gap-4 mt-4">
              {influencer.instagram_followers && (
                <div className="flex items-center gap-1 text-sm">
                  <Instagram className="h-4 w-4 text-pink-500" />
                  <span>{formatNumber(influencer.instagram_followers)}</span>
                </div>
              )}
              {influencer.youtube_subscribers && (
                <div className="flex items-center gap-1 text-sm">
                  <Youtube className="h-4 w-4 text-red-500" />
                  <span>{formatNumber(influencer.youtube_subscribers)}</span>
                </div>
              )}
              {influencer.tiktok_followers && (
                <div className="flex items-center gap-1 text-sm">
                  <Music2 className="h-4 w-4" />
                  <span>{formatNumber(influencer.tiktok_followers)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-muted/50 px-6 py-3 flex items-center justify-between">
        <div className="text-sm">
          {influencer.rate_per_post ? (
            <span className="font-medium">{formatCurrency(influencer.rate_per_post)}/post</span>
          ) : (
            <span className="text-muted-foreground">Rate not set</span>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/influencers/${influencer.id}`}>
            <Button variant="outline" size="sm">View Profile</Button>
          </Link>
          {onRequestClick && influencer.is_available && (
            <Button size="sm" onClick={() => onRequestClick(influencer.id)}>
              Send Request
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
