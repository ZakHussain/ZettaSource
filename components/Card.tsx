import { ReactNode } from "react";
import clsx from "clsx";

export default function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("card-base p-6", className)}>{children}</div>;
}