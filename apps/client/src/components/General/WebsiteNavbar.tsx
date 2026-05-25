"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { User, Bell } from "lucide-react";
import NotificationModal from "../Notifications/NotificationModal";

type User = {
  profileUrl: string;
};

const navLinks = [
  { href: "/feed", label: "FEED" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/jobs", label: "JOBS" },
  { href: "/interview", label: "INTERVIEWS" },
];

export function WebsiteNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [data, setData] = useState<User | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(backendUrl + "/api/v1/users/get-profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!res) throw new Error("Unable to get Data");

        const result = await res.json();
        setData(result.data);
      } catch (err) {
        console.error(err);
      }
    };

    getData();
  }, [backendUrl]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:px-6 font-mono">
        <div className="mx-auto max-w-6xl">
          <div className="premium-panel flex min-h-16 items-center justify-between rounded-[1.75rem] px-4 sm:px-5">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex shrink-0 items-center justify-center text-white cursor-pointer font-bold text-lg relative group/logo"
                aria-label="Home"
              >
                <span className="transition-all duration-300 group-hover/logo:scale-105 inline-block tracking-tight">
                  Persephone
                </span>
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#6BFBBF] transition-all duration-300 group-hover/logo:w-full"></span>
              </Link>
              <div className="hidden rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] uppercase tracking-[0.28em] text-white/45 lg:block">
                Developer Hiring OS
              </div>
            </div>

            <nav className="hidden items-center gap-2 md:flex">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group/link relative rounded-full px-4 py-2 text-sm font-medium tracking-wide text-white/78 transition-all duration-300 hover:bg-white/7 hover:text-white"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <span className="relative inline-block transition-all duration-300 group-hover/link:-translate-y-0.5">
                      {link.label}
                    </span>
                    <span
                      className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#6BFBBF] transition-all duration-300 ${
                        hoveredIndex === index ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNotificationOpen(true)}
                  className="hidden sm:flex items-center justify-center text-white/80 relative group/notification overflow-hidden h-11 w-11 rounded-full border border-white/10 bg-white/5 transition-all duration-300 hover:border-white/20 hover:text-white"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 transition-all duration-300 group-hover/notification:scale-110" />
                  {hasUnreadNotifications && (
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </button>
                <Link
                  href="/profile"
                  className="hidden sm:flex items-center justify-center text-white relative group/profile overflow-hidden h-11 w-11 rounded-full border border-white/10 bg-white/5 hover:border-white/30 transition-all duration-300"
                  aria-label="Profile"
                >
                  {data?.profileUrl ? (
                    <img
                      src={data.profileUrl}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 transition-all duration-300 group-hover/profile:scale-110" />
                  )}
                </Link>

                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-300 md:hidden transition-all duration-300 hover:text-white active:scale-95"
                  aria-label="Menu"
                >
                  <span className="inline-block text-base">{menuOpen ? "✕" : "☰"}</span>
                </button>
              </div>
            </div>
          {menuOpen ? (
            <div className="premium-panel mt-3 overflow-hidden rounded-[1.5rem] md:hidden animate-slideDown">
              <nav className="flex flex-col gap-2 px-4 py-4">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative rounded-xl px-3 py-3 text-neutral-300 transition-all duration-300 hover:bg-white/7 hover:text-white"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                ))}
                <Link
                  href="/profile"
                  className="relative flex items-center gap-2 rounded-xl px-3 py-3 text-neutral-300 transition-all duration-300 hover:bg-white/7 hover:text-white"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    animation: `slideIn 0.3s ease-out ${navLinks.length * 0.05}s both`,
                  }}
                >
                  {data?.profileUrl ? (
                    <img
                      src={data.profileUrl}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span className="relative z-10">PROFILE</span>
                </Link>
              </nav>
            </div>
          ) : null}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
      <NotificationModal
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        setHasUnreadNotifications={setHasUnreadNotifications}
      />
    </>
  );
}
