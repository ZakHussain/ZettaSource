import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="card-base p-10 text-center" data-testid="empty-state">
      <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
      <p className="text-white/70 mb-6">Create your first project to get started building collaborative systems.</p>
      <Link href="/projects/new" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition">
        Create Project
      </Link>
    </div>
  );
}