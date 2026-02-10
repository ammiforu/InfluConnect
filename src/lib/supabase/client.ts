import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

// Bypass the Web Locks API to prevent signInWithPassword from deadlocking
// when a stale session refresh is already holding the lock.
const noopLock = async <R>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> => {
  return fn();
};

export function createClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // Server-side: create new instance each time (will use server.ts instead)
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          lock: noopLock,
        },
      }
    );
  }
  
  return supabaseInstance;
}

// Export a getter function for services to use
export function getSupabaseClient(): SupabaseClient {
  return createClient();
}
