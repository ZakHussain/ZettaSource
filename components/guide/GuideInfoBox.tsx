import { ReactNode } from "react";
import { Flame } from "lucide-react";

export function GuideInfoBox(props: { children: ReactNode }) {
  return (
    <div className="max-w-[768px] w-full overflow-hidden flex-col gap-5 flex text-md my-16 mx-auto">
      <div className="text-4xl flex items-center justify-center gap-2 text-center">
        <Flame className="h-8 w-8 text-amber-500" />
        <span className="font-semibold">+</span> 🦜🔗
      </div>
      <div className="text-sm max-w-[600px] mx-auto text-center">
        {props.children}
      </div>
    </div>
  );
}
