// Common types
export * from './enums';
export * from './auth';
export * from './user';
export * from './campaign';
export * from './message';
export * from './review';

// Pagination response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error type
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// File upload response
export interface FileUploadResponse {
  url: string;
  path: string;
  size: number;
  type: string;
}

// Notification types
export type NotificationType = 
  | 'new_request'
  | 'request_accepted'
  | 'request_rejected'
  | 'new_message'
  | 'deliverable_submitted'
  | 'deliverable_approved'
  | 'deliverable_rejected'
  | 'campaign_completed'
  | 'new_review';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}
