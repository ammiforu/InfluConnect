import type { User } from './auth';
import type { MessageType } from './enums';

// Message
export interface Message {
  id: string;
  campaign_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  file_url: string | null;
  file_name: string | null;
  is_read: boolean;
  created_at: string;
}

// Message with sender info
export interface MessageWithSender extends Message {
  sender: User;
}

// Send message form data
export interface SendMessageFormData {
  content: string;
  file?: File;
}

// Note (campaign notes)
export interface Note {
  id: string;
  campaign_id: string;
  user_id: string;
  content: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

// Note with user info
export interface NoteWithUser extends Note {
  user: User;
}

// Create note form data
export interface CreateNoteFormData {
  content: string;
  is_shared: boolean;
}
