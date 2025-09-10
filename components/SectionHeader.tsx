interface SectionHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function SectionHeader({ title, description, children }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        {description && <p className="text-sm text-white/60 mt-1">{description}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}