export type AppId = 'about' | 'records' | 'player' | 'terminal' | 'hire';
export type Rect = { x: number; y: number; w: number; h: number };
export type Anim = 'opening' | 'minimizing' | 'restoring' | 'closing';

export type WinState = {
  id: AppId;
  rect: Rect;
  /** Rect before maximizing, to restore it. */
  prev?: Rect;
  status: 'open' | 'min' | 'closed';
  max: boolean;
  /** True for ~400 ms while maximize/restore transitions the geometry. */
  maxAnim?: boolean;
  /** Set when the user moved or resized it: a resize of the desk then keeps it in place. */
  touched?: boolean;
  z: number;
  anim: Anim | null;
};
