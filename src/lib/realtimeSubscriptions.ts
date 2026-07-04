import { supabase, isSupabaseConfigured } from './supabase';
import { emitCmsUpdate, CmsEntity } from './cmsEvents';

// Define tables and their mapping to CmsEntity
const tables: { name: string; entity: CmsEntity }[] = [
  { name: 'announcements', entity: 'announcements' },
  { name: 'events', entity: 'events' },
  { name: 'gallery_images', entity: 'gallery_images' },
  { name: 'achievements', entity: 'achievements' },
  { name: 'team_members', entity: 'team_members' },
  { name: 'speakers', entity: 'speakers' }
];

/**
 * Subscribes to postgres_changes on all 5 CMS tables.
 * Triggers emitCmsUpdate(entity) when any INSERT, UPDATE, or DELETE occurs.
 * Returns a cleanup function to unsubscribe.
 */
export function setupRealtimeSubscriptions(): () => void {
  if (!isSupabaseConfigured || !supabase) {
    console.warn("Supabase is not configured, Realtime subscriptions disabled.");
    return () => {};
  }

  // Create a channel and subscribe to public schema postgres changes
  const channel = supabase
    .channel('cms-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      (payload) => {
        const tableName = payload.table;
        const matchingTable = tables.find(t => t.name === tableName);
        if (matchingTable) {
          // Log realtime event details for transparency
          console.log(`[Realtime] Database change detected in '${tableName}':`, payload.eventType, payload.new || payload.old);
          emitCmsUpdate(matchingTable.entity);
        }
      }
    )
    .subscribe((status) => {
      // Store channel status on window object for diagnostics/health check
      if (typeof window !== 'undefined') {
        (window as any).__supabaseRealtimeStatus = status;
      }
      console.log(`[Realtime] Subscription status: ${status}`);
    });

  return () => {
    console.log('[Realtime] Cleaning up subscriptions');
    if (supabase) {
      supabase.removeChannel(channel);
    }
    if (typeof window !== 'undefined') {
      delete (window as any).__supabaseRealtimeStatus;
    }
  };
}
