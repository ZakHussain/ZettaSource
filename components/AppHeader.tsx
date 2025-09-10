"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function AppHeader() {
  const particlesEnabled = useStore(s => s.ui.particlesEnabled);
  const toggleParticles = useStore(s => s.toggleParticles);
  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 md:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-wide text-[color:var(--teal)]">
          ZettaSource
        </Link>
        <nav className="hidden md:flex gap-6 text-white/80">
          <Link href="/" className="hover:text-white transition">Projects</Link>
          <span className="opacity-40">Docs</span>
          <span className="opacity-40">Settings</span>
        </nav>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer" data-testid="particles-toggle">
            <input
              type="checkbox"
              checked={particlesEnabled}
              onChange={toggleParticles}
              className="accent-[color:var(--teal)]"
            />
            Particles
          </label>
          <Link href="/projects/new" className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 transition">
            New Project
          </Link>
        </div>
      </div>
    </header>
  );
}