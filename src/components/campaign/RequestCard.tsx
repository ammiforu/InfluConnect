'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency, formatInitials, formatRelativeTime } from '@/utils/formatters';
import { REQUEST_STATUS_OPTIONS } from '@/utils/constants';
import { Calendar, DollarSign, Clock } from 'lucide-react';
import type { CollaborationRequestWithDetails } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface RequestCardProps {
  request: CollaborationRequestWithDetails;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function RequestCard({ request, onAccept, onReject }: RequestCardProps) {
  const { profile } = useAuth();
  
  const isInfluencer = profile?.role === 'influencer';
  const otherParty = isInfluencer ? request.brand : request.influencer;
  const otherUser = otherParty?.user;
  
  const displayName = isInfluencer
    ? (request.brand as any)?.company_name || 'Brand'
    : `${otherUser?.first_name} ${otherUser?.last_name}`;

  const initials = isInfluencer
    ? (request.brand as any)?.company_name?.substring(0, 2).toUpperCase() || 'BR'
    : formatInitials(otherUser?.first_name || '', otherUser?.last_name || '');

  const imageUrl = isInfluencer
    ? (request.brand as any)?.company_logo_url
    : otherUser?.profile_picture_url;

  const statusOption = REQUEST_STATUS_OPTIONS.find(s => s.value === request.status);

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
              <CardTitle className="text-lg">{request.campaign_title}</CardTitle>
              <p className="text-sm text-muted-foreground">{displayName}</p>
            </div>
          </div>
          <Badge 
            variant={
              request.status === 'accepted' ? 'success' :
              request.status === 'rejected' ? 'destructive' :
              request.status === 'requested' ? 'warning' : 'secondary'
            }
          >
            {statusOption?.label || request.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {request.campaign_description}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{formatCurrency(request.budget)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(request.start_date)} - {formatDate(request.end_date)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatRelativeTime(request.created_at)}</span>
          </div>
        </div>

        {/* Deliverables preview */}
        <div className="text-sm">
          <span className="font-medium">{request.deliverables.length} deliverables: </span>
          <span className="text-muted-foreground">
            {request.deliverables.map(d => d.title).join(', ')}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        <Link href={`/requests/${request.id}`} className="flex-1">
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
        
        {isInfluencer && request.status === 'requested' && (
          <>
            <Button 
              variant="default" 
              onClick={() => onAccept?.(request.id)}
            >
              Accept
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => onReject?.(request.id)}
            >
              Reject
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
