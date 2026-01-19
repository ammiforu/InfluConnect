'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loading } from '@/components/ui/loading';
import { NICHE_OPTIONS } from '@/utils/constants';
import { formatInitials } from '@/utils/formatters';
import { Upload, Instagram, Youtube } from 'lucide-react';
import {
  getInfluencerById,
  getInfluencerByUserId,
  updateInfluencerProfile,
  uploadProfilePicture,
} from '@/services/influencer.service';
import {
  getBrandById,
  getBrandByUserId,
  updateBrandProfile,
  uploadCompanyLogo,
} from '@/services/brand.service';
import type { BrandWithProfile, InfluencerWithProfile } from '@/types';

export default function ProfilePage() {
  const { profile, user, refreshProfile, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [influencer, setInfluencer] = useState<InfluencerWithProfile | null>(null);
  const [brand, setBrand] = useState<BrandWithProfile | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  useEffect(() => {
    const loadProfiles = async () => {
      if (authLoading) return;
      if (!profile) {
        setIsFetchingProfile(false);
        return;
      }
      try {
        if (profile.role === 'influencer') {
          const data = await getInfluencerByUserId(profile.id);
          setInfluencer(data);
        } else {
          const data = await getBrandByUserId(profile.id);
          setBrand(data);
        }
      } catch (error) {
        console.error('Failed to load profile details', error);
      } finally {
        setIsFetchingProfile(false);
      }
    };

    loadProfiles();
  }, [profile, authLoading]);

  // Influencer form state
  const [influencerForm, setInfluencerForm] = useState({
    bio: '',
    niche: '',
    instagram_handle: '',
    instagram_followers: 0,
    youtube_handle: '',
    youtube_subscribers: 0,
    tiktok_handle: '',
    tiktok_followers: 0,
    rate_per_post: 0,
    is_available: true,
  });

  // Brand form state
  const [brandForm, setBrandForm] = useState({
    company_name: '',
    company_description: '',
    industry: '',
    website: '',
  });

  const [profilePicture, setProfilePicture] = useState<string | null>(
    profile?.profile_picture_url || null
  );

  const isInfluencer = profile?.role === 'influencer';
  const initials = formatInitials(profile?.first_name || '', profile?.last_name || '');
  useEffect(() => {
    if (influencer) {
      setInfluencerForm({
        bio: influencer.bio || '',
        niche: influencer.niche || '',
        instagram_handle: influencer.instagram_handle || '',
        instagram_followers: influencer.instagram_followers || 0,
        youtube_handle: influencer.youtube_handle || '',
        youtube_subscribers: influencer.youtube_subscribers || 0,
        tiktok_handle: influencer.tiktok_handle || '',
        tiktok_followers: influencer.tiktok_followers || 0,
        rate_per_post: influencer.rate_per_post || 0,
        is_available: influencer.is_available ?? true,
      });
      setProfilePicture(influencer.user?.profile_picture_url || profilePicture);
    }
  }, [influencer]);

  useEffect(() => {
    if (brand) {
      setBrandForm({
        company_name: brand.company_name,
        company_description: brand.company_description || '',
        industry: brand.industry || '',
        website: brand.website || '',
      });
      setProfilePicture(brand.company_logo_url || profilePicture);
    }
  }, [brand]);

  const handleInfluencerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!influencer) {
        console.log('No influencer found');
        return;
      }
      console.log('Saving influencer profile:', influencerForm);
      console.log('Influencer ID:', influencer.id);
      
      await updateInfluencerProfile(influencer.id, {
        bio: influencerForm.bio,
        niche: influencerForm.niche as any,
        instagram_handle: influencerForm.instagram_handle,
        instagram_followers: influencerForm.instagram_followers,
        youtube_handle: influencerForm.youtube_handle,
        youtube_subscribers: influencerForm.youtube_subscribers,
        tiktok_handle: influencerForm.tiktok_handle,
        tiktok_followers: influencerForm.tiktok_followers,
        rate_per_post: influencerForm.rate_per_post,
        is_available: influencerForm.is_available,
      });
      console.log('Influencer profile updated');
      
      await refreshProfile();
      const updated = await getInfluencerById(influencer.id);
      setInfluencer(updated);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!brand) return;
      await updateBrandProfile(brand.id, brandForm);
      await refreshProfile();
      const updated = await getBrandById(brand.id);
      setBrand(updated);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      if (isInfluencer && profile) {
        await uploadProfilePicture(profile.id, file);
      } else if (brand) {
        await uploadCompanyLogo(brand.id, file);
      }
      await refreshProfile();
      toast.success('Photo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  if (!profile || isFetchingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile information
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {isInfluencer && <TabsTrigger value="social">Social Media</TabsTrigger>}
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profilePicture || undefined} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="profile-upload"
                  onChange={handleFileUpload}
                />
                <label htmlFor="profile-upload">
                  <Button variant="outline" disabled={isUploading} asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Upload Photo'}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Recommended: 400x400px, PNG or JPG
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          {isInfluencer ? (
            <form onSubmit={handleInfluencerSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Influencer Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      placeholder="Tell brands about yourself..."
                      value={influencerForm.bio}
                      onChange={(e) => setInfluencerForm(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Niche</Label>
                      <Select
                        value={influencerForm.niche}
                        onValueChange={(value) => setInfluencerForm(prev => ({ ...prev, niche: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select niche" />
                        </SelectTrigger>
                        <SelectContent>
                          {NICHE_OPTIONS.map((niche) => (
                            <SelectItem key={niche.value} value={niche.value}>
                              {niche.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Rate Per Post ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={influencerForm.rate_per_post}
                        onChange={(e) => setInfluencerForm(prev => ({ 
                          ...prev, 
                          rate_per_post: parseInt(e.target.value) || 0 
                        }))}
                      />
                    </div>
                  </div>


                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="available"
                      checked={influencerForm.is_available}
                      onCheckedChange={(checked) => 
                        setInfluencerForm(prev => ({
                          ...prev,
                          is_available: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="available">Available for collaborations</Label>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          ) : (
            <form onSubmit={handleBrandSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input
                        value={brandForm.company_name}
                        onChange={(e) => setBrandForm(prev => ({ ...prev, company_name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Select
                        value={brandForm.industry}
                        onValueChange={(value) => setBrandForm(prev => ({ ...prev, industry: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {NICHE_OPTIONS.map((niche) => (
                            <SelectItem key={niche.value} value={niche.value}>
                              {niche.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      type="url"
                      placeholder="https://www.example.com"
                      value={brandForm.website}
                      onChange={(e) => setBrandForm(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Company Description</Label>
                    <Textarea
                      placeholder="Tell influencers about your company..."
                      value={brandForm.company_description}
                      onChange={(e) => setBrandForm(prev => ({ ...prev, company_description: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}
        </TabsContent>

        {isInfluencer && (
          <TabsContent value="social" className="mt-6">
            <form onSubmit={handleInfluencerSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Accounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Instagram */}
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <Instagram className="h-6 w-6 text-pink-500 mt-1" />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Instagram Handle</Label>
                        <Input
                          placeholder="@username"
                          value={influencerForm.instagram_handle}
                          onChange={(e) => setInfluencerForm(prev => ({ 
                            ...prev, 
                            instagram_handle: e.target.value 
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Followers</Label>
                        <Input
                          type="number"
                          min="0"
                          value={influencerForm.instagram_followers}
                          onChange={(e) => setInfluencerForm(prev => ({ 
                            ...prev, 
                            instagram_followers: parseInt(e.target.value) || 0 
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* YouTube */}
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <Youtube className="h-6 w-6 text-red-500 mt-1" />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>YouTube Channel</Label>
                        <Input
                          placeholder="Channel name"
                          value={influencerForm.youtube_handle}
                          onChange={(e) => setInfluencerForm(prev => ({ 
                            ...prev, 
                            youtube_handle: e.target.value 
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subscribers</Label>
                        <Input
                          type="number"
                          min="0"
                          value={influencerForm.youtube_subscribers}
                          onChange={(e) => setInfluencerForm(prev => ({ 
                            ...prev, 
                            youtube_subscribers: parseInt(e.target.value) || 0 
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* TikTok */}
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <svg className="h-6 w-6 mt-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>TikTok Handle</Label>
                        <Input
                          placeholder="@username"
                          value={influencerForm.tiktok_handle}
                          onChange={(e) => setInfluencerForm(prev => ({ 
                            ...prev, 
                            tiktok_handle: e.target.value 
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Followers</Label>
                        <Input
                          type="number"
                          min="0"
                          value={influencerForm.tiktok_followers}
                          onChange={(e) => setInfluencerForm(prev => ({ 
                            ...prev, 
                            tiktok_followers: parseInt(e.target.value) || 0 
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>
        )}

        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">First Name</Label>
                  <p className="font-medium">{profile.first_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Name</Label>
                  <p className="font-medium">{profile.last_name}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Role</Label>
                <Badge variant="secondary" className="mt-1">
                  {profile.role === 'influencer' ? 'Influencer' : 'Brand'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
