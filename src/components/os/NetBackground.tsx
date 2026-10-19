// Connected nodes drifting over the wood. Edges near the pointer light up and carry pulses.
import { useEffect, useRef } from 'react';
import { useMotionOff } from './motion';

export default function NetBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useMotionOff();

  useEffect(() => {
    const cv = ref.current!, c = cv.getContext('2d')!;
    let W = 0, H = 0, raf = 0, mx = -1e4, my = -1e4, col = '#000', visible = true;
    let nodes: { bx: number; by: number; p: number; x: number; y: number }[] = [];
    let edges: [number, number][] = [];
    const t0 = performance.now();

    const build = () => {
      const r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      if (!W || !H) return;
      const d = Math.min(devicePixelRatio || 1, 2);
      cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0);
      let s = 7;
      const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
      nodes = Array.from({ length: Math.round((W * H) / 8000) }, () => ({ bx: rnd() * W, by: rnd() * H, p: rnd() * 6.28, x: 0, y: 0 }));
      // Each node links to its 3 nearest neighbours: one pass per node keeping the best three,
      // instead of sorting every distance.
      edges = [];
      const seen = new Set<number>();
      nodes.forEach((a, i) => {
        const best: [number, number][] = [];
        nodes.forEach((b, j) => {
          if (j === i) return;
          const d = (a.bx - b.bx) ** 2 + (a.by - b.by) ** 2;
          if (best.length < 3 || d < best[2][0]) { best.push([d, j]); best.sort((p, q) => p[0] - q[0]); best.length = Math.min(best.length, 3); }
        });
        best.forEach(([, j]) => { if (!seen.has(j * nodes.length + i)) { seen.add(i * nodes.length + j); edges.push([i, j]); } });
      });
      col = getComputedStyle(cv).getPropertyValue('--net').trim();
    };

    const frame = () => {
      const t = (performance.now() - t0) / 1000;
      c.clearRect(0, 0, W, H);
      nodes.forEach((n) => { n.x = n.bx + Math.sin(t * 0.5 + n.p) * 6; n.y = n.by + Math.cos(t * 0.4 + n.p) * 6; });
      c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 1;
      edges.forEach(([i, j], k) => {
        const a = nodes[i], b = nodes[j];
        const near = Math.max(0, 1 - Math.hypot((a.x + b.x) / 2 - mx, (a.y + b.y) / 2 - my) / 200);
        c.globalAlpha = 0.16 + near * 0.5;
        c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
        if (!reduced) {
          const ph = (t * 0.16 + k * 0.071) % 1;
          c.globalAlpha = 0.45 + near * 0.5;
          c.beginPath(); c.arc(a.x + (b.x - a.x) * ph, a.y + (b.y - a.y) * ph, 1.6, 0, 7); c.fill();
        }
      });
      nodes.forEach((n) => {
        const near = Math.max(0, 1 - Math.hypot(n.x - mx, n.y - my) / 160);
        c.globalAlpha = 0.5 + near * 0.5;
        c.beginPath(); c.arc(n.x, n.y, 2 + near * 2.5, 0, 7); c.fill();
      });
      c.globalAlpha = 1;
    };
    // A slow drift doesn't need 60 fps: draw every other frame (about 30 fps). The browser
    // already stops requestAnimationFrame in hidden tabs.
    let odd = false;
    const loop = () => { odd = !odd; if (odd) frame(); raf = requestAnimationFrame(loop); };
    const run = () => { cancelAnimationFrame(raf); if (visible && !reduced) loop(); else frame(); };

    const desk = cv.parentElement!;
    const onMove = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
    const onLeave = () => { mx = my = -1e4; };
    const onTheme = () => { col = getComputedStyle(cv).getPropertyValue('--net').trim(); frame(); };
    desk.addEventListener('pointermove', onMove);
    desk.addEventListener('pointerleave', onLeave);
    addEventListener('themechange', onTheme);
    const mq = matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', onTheme);
    const ro = new ResizeObserver(() => { build(); run(); });
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); });
    io.observe(cv);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      desk.removeEventListener('pointermove', onMove); desk.removeEventListener('pointerleave', onLeave);
      removeEventListener('themechange', onTheme); mq.removeEventListener('change', onTheme);
    };
  }, [reduced]);

  return <canvas className="net" ref={ref} aria-hidden="true" />;
}
