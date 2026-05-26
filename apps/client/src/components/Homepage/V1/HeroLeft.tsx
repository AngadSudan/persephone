"use client";

import { useColors } from "@/components/General/(Color Manager)/useColors";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ROTATING_WORDS = [
  "engineers",
  "designers",
  "architects",
  "full-stack devs",
];

const STATS = [
  { value: "2×", label: "faster hiring decisions" },
  { value: "94%", label: "interviewer confidence" },
  { value: "0", label: "setup required" },
];

export default function HeroLeft() {
  const Colors = useColors();
  const router = useRouter();
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, 300);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-xl">
      {/* Status chip */}
      <div className="flex items-center gap-2 w-fit">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase ${Colors.text.special} border ${Colors.border.specialThick} bg-emerald-500/[0.07]`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          Live interview platform
        </span>
      </div>

      {/* Headline */}
      <div className="space-y-2">
        <h1 className="text-[3.25rem] leading-[1.1] font-bold tracking-tight text-white">
          The workspace built for <br />
          <span
            className={`${Colors.text.special} drop-shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} inline-block`}
            style={{ transition: "opacity 0.3s ease, transform 0.3s ease" }}
          >
            {ROTATING_WORDS[wordIndex]}
          </span>
        </h1>
        <h1 className="text-[3.25rem] leading-[1.1] font-bold tracking-tight text-white">
          interviews.
        </h1>
      </div>

      {/* Body copy */}
      <p
        className={`${Colors.text.secondary} text-[1.05rem] leading-[1.75] font-normal max-w-sm`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Stop asking candidates to paste code into Google Docs. Give them a real
        environment — and see exactly how they think, build, and debug under
        pressure.
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/register")}
          className={`relative px-6 py-3 text-sm font-semibold rounded-lg border ${Colors.border.specialThick} ${Colors.text.special} bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-[0.98] transition-all duration-150`}
        >
          Start interviewing free
        </button>
      </div>

      {/* Stat row */}
      <div className="flex items-stretch gap-px pt-2">
        {STATS.map((s, i) => (
          <div
            key={i}
            className={`flex-1 flex flex-col gap-0.5 px-4 py-3 ${
              i === 0 ? "pl-0" : ""
            } ${i < STATS.length - 1 ? `border-r border-white/10` : ""}`}
          >
            <span
              className={`text-2xl font-bold font-mono ${Colors.text.special}`}
            >
              {s.value}
            </span>
            <span className="text-xs text-white/35 leading-snug">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Social proof */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex -space-x-2">
          {["bg-violet-500", "bg-sky-500", "bg-amber-500", "bg-rose-500"].map(
            (color, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full ${color} border-2 border-black/60 flex items-center justify-center text-[9px] font-bold text-white`}
              >
                {["SB", "MK", "AR", "JL"][i]}
              </div>
            ),
          )}
        </div>
        <p className="text-xs text-white/30 leading-snug">
          Trusted by engineering leads at 200+ companies
        </p>
      </div>
    </div>
  );
}
