export default function AppFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-4 text-xs text-white/50">
        © {new Date().getFullYear()} ZettaSource. Context system for collaborative development.
      </div>
    </footer>
  );
}