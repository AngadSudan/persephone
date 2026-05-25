"use client";

import { WebsiteNavbar } from "@/components/General/WebsiteNavbar";
import { useColors } from "@/components/General/(Color Manager)/useColors";

export default function UserAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const colors = useColors();

  return (
    <div className={`${colors.background.primary} min-h-screen relative overflow-hidden`}>
      <div className="pointer-events-none absolute inset-0 premium-grid opacity-25" />
      <div className="pointer-events-none absolute left-[-12rem] top-[-8rem] h-80 w-80 rounded-full bg-[#6BFBBF]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10rem] right-[-8rem] h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />
      <WebsiteNavbar />
      <main className="relative pt-22">{children}</main>
    </div>
  );
}
