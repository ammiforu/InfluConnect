'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatRelativeTime, formatInitials } from '@/utils/formatters';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'request' | 'campaign' | 'message' | 'deliverable' | 'review';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  link?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityBadge = (type: Activity['type']) => {
    const variants: Record<Activity['type'], { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive' }> = {
      request: { label: 'Request', variant: 'warning' },
      campaign: { label: 'Campaign', variant: 'info' },
      message: { label: 'Message', variant: 'secondary' },
      deliverable: { label: 'Deliverable', variant: 'success' },
      review: { label: 'Review', variant: 'default' },
    };
    return variants[type];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-4 pt-0">
            {activities.map((activity) => {
              const badge = getActivityBadge(activity.type);
              const initials = activity.user?.name
                ? formatInitials(activity.user.name.split(' ')[0], activity.user.name.split(' ')[1] || '')
                : 'AC';

              const content = (
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user?.avatar} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {activity.title}
                      </span>
                      <Badge variant={badge.variant} className="text-xs">
                        {badge.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              );

              return activity.link ? (
                <Link key={activity.id} href={activity.link}>
                  {content}
                </Link>
              ) : (
                <div key={activity.id}>{content}</div>
              );
            })}

            {activities.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No recent activity
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
