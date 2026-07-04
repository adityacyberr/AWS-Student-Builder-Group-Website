export type CmsEntity = 'announcements' | 'events' | 'gallery_images' | 'achievements' | 'team_members' | 'speakers';

let debounceTimer: any = null;
const pendingEntities = new Set<CmsEntity>();

/**
 * Emit a CMS update event for a specific entity.
 * This also triggers a generic 'cms-data-updated' event for backwards compatibility and 'all' listeners.
 * Debounced by 400ms and batched to prevent multiple refetches.
 */
export function emitCmsUpdate(entity: CmsEntity): void {
  if (typeof window === 'undefined') return;

  pendingEntities.add(entity);

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    const entitiesToDispatch = Array.from(pendingEntities);
    pendingEntities.clear();

    // Emit specific entity update events
    entitiesToDispatch.forEach((ent) => {
      window.dispatchEvent(new CustomEvent(`cms-data-updated:${ent}`, { detail: { entity: ent } }));
    });

    // Emit generic update event
    window.dispatchEvent(new Event('cms-data-updated'));
  }, 400);
}


/**
 * Subscribe to CMS updates for a specific entity or 'all' entities.
 * Returns an unsubscribe/cleanup function.
 */
export function subscribeCmsUpdates(
  entity: CmsEntity | 'all',
  callback: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const eventName = entity === 'all' ? 'cms-data-updated' : `cms-data-updated:${entity}`;
  window.addEventListener(eventName, callback);

  return () => {
    window.removeEventListener(eventName, callback);
  };
}
