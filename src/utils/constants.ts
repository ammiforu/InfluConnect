// Application constants
export const APP_NAME = 'InfluConnect';
export const APP_DESCRIPTION = 'Connect influencers with brands for campaign collaborations';

// API Routes
export const API_BASE_URL = '/api/v1';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// File upload limits
export const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

// Niche options for select
export const NICHE_OPTIONS = [
  { value: 'fashion', label: 'Fashion' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'tech', label: 'Technology' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'food', label: 'Food & Cooking' },
  { value: 'travel', label: 'Travel' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'business', label: 'Business' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'parenting', label: 'Parenting' },
  { value: 'pets', label: 'Pets' },
  { value: 'sports', label: 'Sports' },
  { value: 'music', label: 'Music' },
  { value: 'art', label: 'Art & Design' },
  { value: 'photography', label: 'Photography' },
  { value: 'other', label: 'Other' },
] as const;

// Availability status options
export const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available', color: 'green' },
  { value: 'busy', label: 'Busy', color: 'yellow' },
  { value: 'unavailable', label: 'Unavailable', color: 'red' },
] as const;

// Request status options
export const REQUEST_STATUS_OPTIONS = [
  { value: 'requested', label: 'Pending', color: 'yellow' },
  { value: 'accepted', label: 'Accepted', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'purple' },
] as const;

// Campaign status options
export const CAMPAIGN_STATUS_OPTIONS = [
  { value: 'accepted', label: 'Accepted', color: 'green' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'purple' },
  { value: 'archived', label: 'Archived', color: 'gray' },
] as const;

// Deliverable type options
export const DELIVERABLE_TYPE_OPTIONS = [
  { value: 'post', label: 'Post' },
  { value: 'story', label: 'Story' },
  { value: 'video', label: 'Video' },
  { value: 'reel', label: 'Reel' },
  { value: 'other', label: 'Other' },
] as const;

// Deliverable status options
export const DELIVERABLE_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'submitted', label: 'Submitted', color: 'blue' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Needs Revision', color: 'red' },
] as const;

// Social platform icons and colors
export const SOCIAL_PLATFORMS = {
  instagram: { name: 'Instagram', color: '#E4405F' },
  tiktok: { name: 'TikTok', color: '#000000' },
  youtube: { name: 'YouTube', color: '#FF0000' },
  twitter: { name: 'Twitter/X', color: '#1DA1F2' },
  linkedin: { name: 'LinkedIn', color: '#0A66C2' },
} as const;

// Industry options for brands
export const INDUSTRY_OPTIONS = [
  'Technology',
  'Fashion & Apparel',
  'Beauty & Cosmetics',
  'Food & Beverage',
  'Health & Fitness',
  'Travel & Hospitality',
  'Finance',
  'Entertainment',
  'Education',
  'Automotive',
  'Real Estate',
  'Retail',
  'Non-profit',
  'Other',
] as const;

// Navigation links
export const NAV_LINKS = {
  influencer: [
    { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/requests', label: 'Requests', icon: 'Inbox' },
    { href: '/campaigns', label: 'Campaigns', icon: 'Briefcase' },
    { href: '/profile', label: 'My Profile', icon: 'User' },
    { href: '/settings', label: 'Settings', icon: 'Settings' },
  ],
  brand: [
    { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/browse', label: 'Browse Influencers', icon: 'Search' },
    { href: '/requests', label: 'Requests', icon: 'Send' },
    { href: '/campaigns', label: 'Campaigns', icon: 'Briefcase' },
    { href: '/profile', label: 'Company Profile', icon: 'Building2' },
    { href: '/settings', label: 'Settings', icon: 'Settings' },
  ],
} as const;
