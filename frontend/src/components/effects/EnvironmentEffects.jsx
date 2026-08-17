import { useEffect, useMemo, useRef } from 'react';

/* Reusable environmental effect layers for the cinematic hero & season explorer.
   Canvas effects pause when offscreen or when the tab is hidden. */

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

function useCanvas(draw, density = 1) {
  const ref = useRef(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf = null;
    let running = false;
    let particles = [];
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = drawRef.current.init(w, h, isMobile() ? density * 0.45 : density);
    };

    const loop = (t) => {
      if (running) {
        ctx.clearRect(0, 0, w, h);
        drawRef.current.frame(ctx, particles, w, h, t);
        raf = requestAnimationFrame(loop);
      }
    };

    const start = () => {
      if (!running && !document.hidden) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.02 });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', resize);
    resize();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', resize);
    };
  }, [density]);

  return ref;
}

/* ---------------- SNOW: 3 depth layers, wind, soft foreground flakes ---------------- */
export function Snow({ density = 1 }) {
  const ref = useCanvas({
    init(w, h, d) {
      const count = Math.floor(((w * h) / 9000) * d);
      return Array.from({ length: count }, () => {
        const layer = Math.random();
        const r = layer > 0.82 ? 2.6 + Math.random() * 1.8 : layer > 0.4 ? 1.3 + Math.random() * 1.2 : 0.5 + Math.random() * 0.8;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r,
          speed: 0.35 + r * 0.28,
          phase: Math.random() * Math.PI * 2,
          sway: 0.4 + Math.random() * 1.1,
          opacity: layer > 0.82 ? 0.5 + Math.random() * 0.3 : 0.55 + Math.random() * 0.4,
          soft: layer > 0.82,
        };
      });
    },
    frame(ctx, ps, w, h, t) {
      const wind = Math.sin(t / 6000) * 0.45;
      for (const p of ps) {
        p.y += p.speed;
        p.x += Math.sin(t / 1400 + p.phase) * p.sway * 0.3 + wind;
        if (p.y > h + 6) { p.y = -6; p.x = Math.random() * w; }
        if (p.x > w + 6) p.x = -6;
        if (p.x < -6) p.x = w + 6;
        ctx.globalAlpha = p.opacity;
        if (p.soft) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.2);
          g.addColorStop(0, 'rgba(255,255,255,0.95)');
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    },
  }, density);
  return <canvas ref={ref} data-testid="fx-snow" className="pointer-events-none absolute inset-0 z-20" aria-hidden="true" />;
}

/* ---------------- RAIN: layered streaks with wind ---------------- */
export function Rain({ density = 1 }) {
  const ref = useCanvas({
    init(w, h, d) {
      const count = Math.floor(((w * h) / 5200) * d);
      return Array.from({ length: count }, () => {
        const depth = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          len: depth > 0.6 ? 14 + Math.random() * 14 : 6 + Math.random() * 8,
          speed: depth > 0.6 ? 11 + Math.random() * 6 : 6 + Math.random() * 4,
          opacity: depth > 0.6 ? 0.28 + Math.random() * 0.2 : 0.1 + Math.random() * 0.14,
        };
      });
    },
    frame(ctx, ps, w, h) {
      ctx.lineCap = 'round';
      for (const p of ps) {
        p.y += p.speed;
        p.x += 1.6;
        if (p.y > h + p.len) { p.y = -p.len; p.x = Math.random() * w - 40; }
        ctx.strokeStyle = `rgba(210,228,244,${p.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 2.4, p.y + p.len);
        ctx.stroke();
      }
    },
  }, density);
  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
      <div className="absolute inset-0 bg-sky-950/10" />
      <canvas ref={ref} data-testid="fx-rain" className="absolute inset-0" />
    </div>
  );
}

/* ---------------- SUN RAYS: soft rotating volumetric light ---------------- */
export function SunRays({ warm = true }) {
  const c = warm ? '255,209,140' : '255,236,190';
  const bg = `conic-gradient(from 160deg at 74% 8%, transparent 0deg, rgba(${c},0.16) 6deg, transparent 12deg, transparent 20deg, rgba(${c},0.22) 28deg, transparent 36deg, transparent 46deg, rgba(${c},0.13) 52deg, transparent 60deg)`;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      <div data-testid="fx-sunrays" className="sun-rays" style={{ inset: '-30%', background: bg }} />
    </div>
  );
}

/* ---------------- CLOUDS ---------------- */
export function Clouds({ count = 3 }) {
  const clouds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        top: `${4 + i * 9 + Math.random() * 6}%`,
        width: `${26 + Math.random() * 26}vw`,
        height: `${7 + Math.random() * 6}vh`,
        duration: `${70 + Math.random() * 60}s`,
        delay: `${-Math.random() * 70}s`,
        opacity: 0.35 + Math.random() * 0.3,
      })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      {clouds.map((c, i) => (
        <div key={i} data-testid={`fx-cloud-${i}`} className="cloud" style={c} />
      ))}
    </div>
  );
}

/* ---------------- MIST ---------------- */
export function Mist() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/5 overflow-hidden" aria-hidden="true">
      <div data-testid="fx-mist-1" className="mist-band" style={{ left: '-8%', right: '-8%', bottom: '8%', height: '60%', animationDuration: '22s' }} />
      <div data-testid="fx-mist-2" className="mist-band" style={{ left: '-14%', right: '-14%', bottom: '-6%', height: '70%', animationDuration: '30s', animationDelay: '-9s' }} />
    </div>
  );
}

/* ---------------- BIRDS ---------------- */
function BirdPath({ size = 22 }) {
  return (
    <svg width={size} height={size * 0.5} viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M2 10 Q7 2 12 9 Q17 2 22 10" />
    </svg>
  );
}
export function Birds({ count = 3, light = true }) {
  const birds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        top: `${10 + Math.random() * 26}%`,
        duration: `${26 + Math.random() * 18}s`,
        delay: `${-Math.random() * 30}s`,
        size: 14 + Math.random() * 12,
        flapDelay: `${-Math.random()}s`,
      })),
    [count]
  );
  return (
    <div className={`pointer-events-none absolute inset-0 z-10 overflow-hidden ${light ? 'text-white/70' : 'text-ocean/50'}`} aria-hidden="true">
      {birds.map((b, i) => (
        <div
          key={i}
          data-testid={`fx-bird-${i}`}
          className="bird"
          style={{ top: b.top, animationDuration: b.duration, animationDelay: b.delay }}
        >
          <span style={{ animationDelay: b.flapDelay, display: 'block' }}>
            <BirdPath size={b.size} />
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- WATER SHIMMER ---------------- */
export function WaterShimmer() {
  return <div data-testid="fx-shimmer" className="water-shimmer h-1/3 z-10 opacity-70" aria-hidden="true" />;
}

/* ---------------- WATER DROPLET -> RIPPLE (Kashmir lake micro-moment) ---------------- */
export function Droplet() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 hidden md:block" aria-hidden="true">
      <div data-testid="fx-droplet" className="droplet" style={{ left: '22%', top: '10%' }} />
      <div data-testid="fx-ripple-1" className="ripple-ring" style={{ left: '22%', top: 'calc(10% + 48vh)', animationDelay: '0s' }} />
      <div data-testid="fx-ripple-2" className="ripple-ring" style={{ left: '22%', top: 'calc(10% + 48vh)', animationDelay: '0.5s', width: '90px', height: '24px' }} />
    </div>
  );
}

/* ---------------- GOLDEN DUST ---------------- */
export function Dust({ count = 16 }) {
  const motes = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: `${Math.random() * 100}%`,
        bottom: `${Math.random() * 30}%`,
        size: 3 + Math.random() * 5,
        duration: `${14 + Math.random() * 14}s`,
        delay: `${-Math.random() * 20}s`,
      })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      {motes.map((m, i) => (
        <div
          key={i}
          data-testid={`fx-dust-${i}`}
          className="dust-mote"
          style={{ left: m.left, bottom: m.bottom, width: m.size, height: m.size, animationDuration: m.duration, animationDelay: m.delay }}
        />
      ))}
    </div>
  );
}

/* ---------------- STARS (subtle, for night scenes) ---------------- */
export function Stars({ count = 34 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 45}%`,
        size: 1 + Math.random() * 1.6,
        duration: `${2.6 + Math.random() * 3.5}s`,
        delay: `${-Math.random() * 4}s`,
      })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
      {stars.map((s, i) => (
        <div
          key={i}
          className="star-dot"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDuration: s.duration, animationDelay: s.delay }}
        />
      ))}
    </div>
  );
}

/* ---------------- FLAG BUNTING (Rajasthan / Wagah festive wind) ---------------- */
const PENNANT_COLORS = ['#FF9933', '#D4AF37', '#1ABC9C', '#FFFFFF', '#FF7F50'];
export function Bunting() {
  const pennants = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-16 z-10 hidden opacity-90 md:block" aria-hidden="true">
      <svg data-testid="fx-bunting" viewBox="0 0 1200 90" className="w-full" preserveAspectRatio="none" style={{ height: '90px' }}>
        <path d="M0 8 Q 300 60 600 30 T 1200 22" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" />
        {pennants.map((i) => {
          const t = i / 11;
          const x = 40 + t * 1120;
          const y = 8 + Math.sin(t * Math.PI * 2) * 12 + (t > 0.5 ? 6 : 12);
          return (
            <path
              key={i}
              className="flag-pennant"
              style={{ animationDuration: `${2.2 + (i % 4) * 0.5}s`, animationDelay: `${-i * 0.33}s` }}
              d={`M ${x} ${y} l 16 3 l -9 22 z`}
              fill={PENNANT_COLORS[i % PENNANT_COLORS.length]}
              opacity="0.92"
            />
          );
        })}
      </svg>
    </div>
  );
}

/* ---------------- dispatcher ---------------- */
const REGISTRY = { snow: Snow, rain: Rain, sunrays: SunRays, clouds: Clouds, mist: Mist, birds: Birds, shimmer: WaterShimmer, droplet: Droplet, dust: Dust, stars: Stars, bunting: Bunting };

export function EffectLayer({ effects = [] }) {
  return (
    <>
      {effects.map((name) => {
        const Cmp = REGISTRY[name];
        return Cmp ? <Cmp key={name} /> : null;
      })}
    </>
  );
}
