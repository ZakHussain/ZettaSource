import Image from "next/image";
import { Board } from "@/lib/types";
import clsx from "clsx";

export default function BoardCard({
  board, selected, onSelect
}: { board: Board; selected?: boolean; onSelect?: () => void }) {
  return (
    <button
      onClick={onSelect}
      data-testid={`board-card-${board.id}`}
      className={clsx(
        "card-base card-hover text-left p-4 w-full",
        selected && "ring-2 ring-teal-400/60 bg-teal-400/5"
      )}
    >
      <div className="flex gap-4">
        <div className="relative h-20 w-28 rounded-md overflow-hidden bg-black/30 flex-shrink-0">
          <Image 
            src={board.imageSrc} 
            alt={board.name} 
            fill 
            className="object-cover" 
            sizes="112px"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{board.name}</div>
          <div className="text-xs text-white/60 mt-1">FQBN: {board.fqbn}</div>
          <div className="text-xs text-white/60 mt-1">
            {board.voltage} · D{board.digitalPins} · A{board.analogPins}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {board.tags.map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}