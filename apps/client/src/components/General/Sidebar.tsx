"use client";

import Link from "next/link";
import React from "react";
import { FolderKanban, House, MessageSquareText, BriefcaseBusiness } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { usePathname } from "next/navigation";

const Links = [
  { href: "/feed", label: "Feed", icon: House },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/interview", label: "Interviews", icon: MessageSquareText },
];

function Sidebar() {
  const pathname = usePathname();
  const user = useUserStore((state) => state.info);

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  const displayName = user?.name || "Guest User";
  const displayEmail = user?.email || "No email available";

  return (
    <div
      className={`premium-panel w-full h-full min-h-0 rounded-[1.75rem] flex flex-col overflow-hidden font-mono`}
    >
      <div className="border-b border-white/10 px-4 pb-4 pt-5 sm:px-5">
        <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">
          Workspace
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">User Console</h2>
      </div>

      <nav className="flex-1 p-3 sm:p-4">
        <ul className="space-y-2">
          {Links.map((link) => (
            <li key={link.label}>
              {(() => {
                const active = pathname === link.href;
                return (
              <Link
                href={link.href}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-[#6BFBBF] text-black shadow-[0_12px_30px_rgba(107,251,191,0.22)]"
                    : "bg-white/[0.04] text-white/82 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    active ? "bg-black/10" : "bg-white/[0.06] group-hover:bg-white/[0.09]"
                  }`}
                >
                  <link.icon size={20} className="shrink-0" />
                </div>
                <div className="flex flex-1 items-center justify-between">
                  <span>{link.label}</span>
                  <span className={`text-xs ${active ? "text-black/60" : "text-white/35"}`}>0{Links.indexOf(link) + 1}</span>
                </div>
              </Link>
                );
              })()}
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3 sm:p-4">
        <Link href="/profile" className="block">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition-all hover:bg-white/[0.07]">
            <div className="mb-3 flex items-center gap-3">
            {user?.profileUrl ? (
              <img
                src={user.profileUrl}
                alt={displayName}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
                {initials}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-white/55">{displayEmail}</p>
            </div>
            </div>
            <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-white/45">
              Open profile
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
