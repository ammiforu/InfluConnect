// User roles
export type UserRole = 'influencer' | 'brand';

// Availability status for influencers
export type AvailabilityStatus = 'available' | 'busy' | 'unavailable';

// Campaign/Request status
export type RequestStatus = 'requested' | 'accepted' | 'rejected' | 'in_progress' | 'completed';

// Campaign status (after acceptance)
export type CampaignStatus = 'accepted' | 'in_progress' | 'completed' | 'archived';

// Deliverable types
export type DeliverableType = 'post' | 'story' | 'video' | 'reel' | 'other';

// Deliverable status
export type DeliverableStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

// Message types
export type MessageType = 'text' | 'file' | 'system';

// Social media platforms
export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin' | 'other';

// Niche categories
export type NicheCategory = 
  | 'fashion'
  | 'beauty'
  | 'fitness'
  | 'tech'
  | 'gaming'
  | 'food'
  | 'travel'
  | 'lifestyle'
  | 'business'
  | 'entertainment'
  | 'education'
  | 'health'
  | 'parenting'
  | 'pets'
  | 'sports'
  | 'music'
  | 'art'
  | 'photography'
  | 'other';
