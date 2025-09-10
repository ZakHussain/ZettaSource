import "./globals.css";
import { ReactNode } from "react";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import CanvasParticles from "@/components/CanvasParticles";

export const metadata = {
  title: "ZettaSource",
  description: "Context system for building complex systems collaboratively",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="fixed inset-0 -z-10">
          <CanvasParticles />
        </div>
        <div className="relative flex min-h-screen flex-col">
          <AppHeader />
          <main className="mx-auto w-full max-w-6xl px-4 md:px-6 py-8 flex-1">
            {children}
          </main>
          <AppFooter />
        </div>
      </body>
    </html>
  );
}