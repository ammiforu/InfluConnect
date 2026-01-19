import type { Brand, Influencer } from './user';
import type { User } from './auth';
import type { RequestStatus, CampaignStatus, DeliverableType, DeliverableStatus } from './enums';

// Deliverable item (in request/campaign)
export interface DeliverableItem {
  id: string;
  title: string;
  description: string;
  type: DeliverableType;
  quantity: number;
}

// Collaboration request
export interface CollaborationRequest {
  id: string;
  brand_id: string;
  influencer_id: string;
  campaign_title: string;
  campaign_description: string;
  deliverables: DeliverableItem[];
  budget: number;
  start_date: string;
  end_date: string;
  deadline: string;
  status: RequestStatus;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

// Request with related data
export interface CollaborationRequestWithDetails extends CollaborationRequest {
  brand: Brand & { user: User };
  influencer: Influencer & { user: User };
}

// Create request form data
export interface CreateRequestFormData {
  influencer_id: string;
  campaign_title: string;
  campaign_description: string;
  requirements?: string;
  budget: number;
  start_date: string;
  end_date: string;
}

// Campaign (accepted collaboration)
export interface Campaign {
  id: string;
  brand_id: string;
  influencer_id: string;
  title: string;
  description: string;
  status: CampaignStatus;
  progress_percentage: number;
  budget: number;
  start_date: string;
  end_date: string;
  deadline: string;
  created_at: string;
  updated_at: string;
}

// Campaign with related data
export interface CampaignWithDetails extends Campaign {
  brand: Brand & { user: User };
  influencer: Influencer & { user: User };
  deliverables: Deliverable[];
}

// Deliverable tracking
export interface Deliverable {
  id: string;
  campaign_id: string;
  title: string;
  description: string;
  type: DeliverableType;
  status: DeliverableStatus;
  submission_url: string | null;
  submission_notes: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// Submit deliverable form data
export interface SubmitDeliverableFormData {
  submission_url: string;
  submission_notes?: string;
}

// Campaign filter params
export interface CampaignFilterParams {
  status?: CampaignStatus;
  page?: number;
  limit?: number;
}

// Request filter params
export interface RequestFilterParams {
  status?: RequestStatus;
  page?: number;
  limit?: number;
}
