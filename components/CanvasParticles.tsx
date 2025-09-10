"use client";
import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";

export default function CanvasParticles() {
  const enabled = useStore(s => s.ui.particlesEnabled);
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth * devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * devicePixelRatio);

    const onResize = () => {
      width = canvas.width = canvas.offsetWidth * devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    const pr = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = pr ? 40 : 100;

    const particles = new Array(N).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 1.2 + Math.random() * 1.2,
    }));

    let raf = 0;
    const draw = () => {
      if (!enabled) { 
        ctx.clearRect(0,0,width,height); 
        raf = requestAnimationFrame(draw); 
        return; 
      }
      
      ctx.clearRect(0,0,width,height);
      
      // Draw particles
      for (const p of particles) {
        p.x += p.vx; 
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(51,195,200,0.6)";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(197,116,58,0.6)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      // Draw connections
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx*dx + dy*dy;
          if (d2 < (120 * devicePixelRatio) ** 2) {
            ctx.strokeStyle = "rgba(255,122,89,0.08)";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
    };
  }, [enabled]);

  return <canvas ref={ref} className="h-full w-full pointer-events-none opacity-90" />;
}