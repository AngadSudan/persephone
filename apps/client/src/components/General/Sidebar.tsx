"use client";

import Link from "next/link";
import React from "react";
import { FolderKanban, House, MessageSquareText } from "lucide-react";
import { useColors } from "./(Color Manager)/useColors";
import { useUserStore } from "@/store/user-store";

const Links = [
  { href: "/feed", label: "Feed", icon: House },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/interview", label: "Interviews", icon: MessageSquareText },
];

function Sidebar() {
  const Colors = useColors();
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
      className={`w-full h-full min-h-0 rounded-md ${Colors.background.secondary} flex flex-col overflow-hidden font-mono`}
    >
      <nav className="flex-1 p-3 sm:p-4">
        <ul className="space-y-1">
          {Links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 rounded-md px-3 py-4 text-lg font-medium my-2 transition-colors ${Colors.background.primary} ${Colors.text.primary} ${Colors.properties.interactiveButton}`}
              >
                <link.icon size={26} className="shrink-0" />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3 sm:p-4">
        <Link href="/profile" className="block">
          <div className="flex items-center gap-3 rounded-md bg-white/5 p-2.5 transition-opacity hover:opacity-90">
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
              <p className="truncate text-xs opacity-80">{displayEmail}</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
