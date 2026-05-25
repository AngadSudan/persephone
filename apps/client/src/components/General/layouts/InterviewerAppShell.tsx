"use client";

import InterviewerNavbar from "@/components/Interviewer/Profile/v1/InterviewerNavbar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const interviewerLinks = [
  { href: "/interviewer-dashboard", label: "Profile" },
  { href: "/interviewer-dashboard/interview-suite", label: "Interview Suites" },
  { href: "/interviewer-dashboard/wishlist", label: "Wishlists" },
  { href: "/interviewer-dashboard/job-listing", label: "Job Listings" },
];

export default function InterviewerAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#121313] text-white">
      <InterviewerNavbar />
      <div className="px-4 pt-12 md:px-6">
        <nav className="mx-auto mb-4 flex max-w-7xl flex-wrap gap-2 rounded-xl border border-white/10 bg-white/5 p-2 font-mono">
          {interviewerLinks.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/interviewer-dashboard" &&
                pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[#6BFBBF] text-black"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
