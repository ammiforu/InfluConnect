import { createClient } from '@/lib/supabase/client';
import type { Message, MessageWithSender } from '@/types';

const supabase = createClient();

export async function getMessages(
  campaignId: string,
  page = 1,
  limit = 50
): Promise<{ messages: MessageWithSender[]; total: number }> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users(*)
    `, { count: 'exact' })
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    messages: (data || []) as MessageWithSender[],
    total: count || 0,
  };
}

export async function sendMessage(
  campaignId: string,
  senderId: string,
  content: string,
  fileUrl?: string,
  fileName?: string
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      campaign_id: campaignId,
      sender_id: senderId,
      content,
      message_type: fileUrl ? 'file' : 'text',
      file_url: fileUrl,
      file_name: fileName,
      is_read: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Message;
}

export async function markMessagesAsRead(
  campaignId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('campaign_id', campaignId)
    .neq('sender_id', userId)
    .eq('is_read', false);

  if (error) {
    throw new Error(error.message);
  }
}

export async function uploadMessageFile(
  campaignId: string,
  file: File
): Promise<{ url: string; name: string }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${campaignId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('message-files')
    .upload(fileName, file);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from('message-files')
    .getPublicUrl(fileName);

  return {
    url: data.publicUrl,
    name: file.name,
  };
}

// Subscribe to new messages (realtime)
export function subscribeToMessages(
  campaignId: string,
  callback: (message: Message) => void
) {
  return supabase
    .channel(`messages:${campaignId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `campaign_id=eq.${campaignId}`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();
}

export function unsubscribeFromMessages(campaignId: string) {
  supabase.removeChannel(supabase.channel(`messages:${campaignId}`));
}
