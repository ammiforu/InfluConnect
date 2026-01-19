'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getInfluencerById } from '@/services/influencer.service';
import { getBrandByUserId } from '@/services/brand.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { SendRequestForm } from '@/components/brand/SendRequestForm';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Instagram, Youtube, Music2, Mail, ArrowLeft, DollarSign } from 'lucide-react';
import { formatNumber, formatInitials, formatCurrency } from '@/utils/formatters';
import { NICHE_OPTIONS } from '@/utils/constants';
import type { InfluencerWithProfile, BrandWithProfile } from '@/types';

export default function InfluencerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const toast = useToast();
  const [influencer, setInfluencer] = useState<InfluencerWithProfile | null>(null);
  const [brand, setBrand] = useState<BrandWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  const id = params.id as string;
  const isBrand = profile?.role === 'brand';

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getInfluencerById(id);
        setInfluencer(data);
        
        // If user is a brand, load their brand profile
        if (profile?.role === 'brand') {
          const brandData = await getBrandByUserId(profile.id);
          setBrand(brandData);
        }
      } catch (error) {
        console.error('Failed to load influencer:', error);
        toast.error('Failed to load influencer profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, profile, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Influencer not found</h2>
        <p className="text-muted-foreground mt-2">This influencer profile doesn't exist.</p>
        <Button onClick={() => router.push('/discover')} className="mt-4">
          Back to Discover
        </Button>
      </div>
    );
  }

  const user = influencer.user;
  const fullName = `${user.first_name} ${user.last_name}`;
  const initials = formatInitials(user.first_name, user.last_name);
  const nicheLabel = NICHE_OPTIONS.find(n => n.value === influencer.niche)?.label || influencer.niche;

  const handleRequestSuccess = () => {
    setIsRequestDialogOpen(false);
    toast.success('Collaboration request sent successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={user.profile_picture_url || undefined} alt={fullName} />
              <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{fullName}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    {nicheLabel && <Badge variant="secondary">{nicheLabel}</Badge>}
                    <Badge variant={influencer.is_available ? 'success' : 'secondary'}>
                      {influencer.is_available ? 'Available' : 'Not Available'}
                    </Badge>
                  </div>
                </div>

                {isBrand && brand && (
                  <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Collaboration Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                      <DialogHeader>
                        <DialogTitle>Send Collaboration Request to {fullName}</DialogTitle>
                      </DialogHeader>
                      <SendRequestForm 
                        influencerId={influencer.id}
                        brandId={brand.id}
                        onSuccess={handleRequestSuccess}
                        onCancel={() => setIsRequestDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {influencer.bio && (
                <p className="mt-4 text-muted-foreground">{influencer.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rate Per Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">
                {formatCurrency(influencer.rate_per_post || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Instagram */}
        {influencer.instagram_handle && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Instagram
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Instagram className="h-5 w-5 text-pink-500 mr-2" />
                <div>
                  <span className="text-2xl font-bold">
                    {formatNumber(influencer.instagram_followers || 0)}
                  </span>
                  <p className="text-sm text-muted-foreground">@{influencer.instagram_handle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* YouTube */}
        {influencer.youtube_handle && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                YouTube
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Youtube className="h-5 w-5 text-red-500 mr-2" />
                <div>
                  <span className="text-2xl font-bold">
                    {formatNumber(influencer.youtube_subscribers || 0)}
                  </span>
                  <p className="text-sm text-muted-foreground">@{influencer.youtube_handle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TikTok */}
        {influencer.tiktok_handle && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                TikTok
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Music2 className="h-5 w-5 text-black mr-2" />
                <div>
                  <span className="text-2xl font-bold">
                    {formatNumber(influencer.tiktok_followers || 0)}
                  </span>
                  <p className="text-sm text-muted-foreground">@{influencer.tiktok_handle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Bio</h3>
            <p className="text-muted-foreground mt-1">
              {influencer.bio || 'No bio provided'}
            </p>
          </div>
          <div>
            <h3 className="font-medium">Niche</h3>
            <p className="text-muted-foreground mt-1">{nicheLabel || 'Not specified'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
