// React.lazy that shows nothing instead of taking the desk down when a chunk can't load
// (an old tab after a deploy deleted the old chunks, or no network).
import { lazy, type ComponentType } from 'react';

export function lazyOrNothing<P extends object>(load: () => Promise<{ default: ComponentType<P> }>) {
  return lazy(() => load().catch(() => ({ default: (() => null) as ComponentType<P> })));
}
