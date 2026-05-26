"use client";

import { useColors } from "@/components/General/(Color Manager)/useColors";
import { useEffect, useState } from "react";
import Image from "next/image";

/* ─── Swap these 3 paths for your real photos ─── */
const CANDIDATE_PHOTOS = [
  "/images/candidates/candidate-1.jpg",
  "/images/candidates/candidate-2.jpg",
  "/images/candidates/candidate-3.jpg",
];

/* ─── Per-slide candidate metadata ─── */
const CANDIDATES = [
  {
    name: "Aryan Mehta",
    role: "Senior Backend Engineer",
    initials: "AM",
    startElapsed: 2294,
  },
  {
    name: "Sarah Lin",
    role: "Full-Stack Engineer",
    initials: "SL",
    startElapsed: 1452,
  },
  {
    name: "Marcus Okafor",
    role: "Platform Engineer",
    initials: "MO",
    startElapsed: 3071,
  },
];

const CODE_SNIPPET = [
  {
    ln: 1,
    tokens: [
      { t: "async ", c: "kw" },
      { t: "function ", c: "kw" },
      { t: "getUser", c: "fn" },
      { t: "(id: ", c: "def" },
      { t: "string", c: "ty" },
      { t: ") {", c: "def" },
    ],
  },
  {
    ln: 2,
    tokens: [
      { t: "  const ", c: "kw" },
      { t: "cached", c: "def" },
      { t: " = await ", c: "kw" },
      { t: "cache", c: "fn" },
      { t: ".get(id);", c: "def" },
    ],
  },
  {
    ln: 3,
    tokens: [
      { t: "  if ", c: "kw" },
      { t: "(cached) ", c: "def" },
      { t: "return ", c: "kw" },
      { t: "cached;", c: "def" },
    ],
  },
  { ln: 4, tokens: [], blank: true },
  {
    ln: 5,
    tokens: [
      { t: "  const ", c: "kw" },
      { t: "user", c: "def" },
      { t: " = await ", c: "kw" },
      { t: "db", c: "fn" },
      { t: ".users", c: "def" },
      { t: ".findOne(", c: "def" },
    ],
    flag: "warn",
  },
  {
    ln: 6,
    tokens: [
      { t: "    { _id: ", c: "def" },
      { t: "id ", c: "def" },
      { t: "}", c: "def" },
    ],
    flag: "warn",
  },
  { ln: 7, tokens: [{ t: "  );", c: "def" }] },
  { ln: 8, tokens: [], blank: true },
  {
    ln: 9,
    tokens: [
      { t: "  await ", c: "kw" },
      { t: "cache", c: "fn" },
      { t: ".set(id, user, ", c: "def" },
      { t: "3600", c: "num" },
      { t: ");", c: "def" },
    ],
  },
  {
    ln: 10,
    tokens: [
      { t: "  return ", c: "kw" },
      { t: "user;", c: "def" },
    ],
  },
  { ln: 11, tokens: [{ t: "}", c: "def" }] },
];

const COMMENTS = [
  {
    id: 1,
    line: "5–6",
    type: "warn" as const,
    author: "You",
    text: "No null-check after findOne — will throw if user doesn't exist.",
  },
  {
    id: 2,
    line: "9",
    type: "ok" as const,
    author: "You",
    text: "Good call caching with TTL. Consider invalidation on update.",
  },
];

const TEST_RESULTS = [
  { label: "GET /user/:id — found", pass: true },
  { label: "GET /user/:id — missing user", pass: false },
  { label: "Cache hit returns early", pass: true },
  { label: "TTL expiry re-fetches DB", pass: true },
];

const TOKEN_COLORS: Record<string, string> = {
  kw: "text-purple-400",
  fn: "text-sky-300",
  ty: "text-emerald-400",
  def: "text-white/70",
  num: "text-amber-300",
};

const SLIDE_DURATION = 5000; // ms each candidate is shown

export default function HeroRight() {
  const Colors = useColors();

  /* ─── Slideshow state ─── */
  const [slideIndex, setSlideIndex] = useState(0);
  const [slidePhase, setSlidePhase] = useState<"enter" | "idle" | "exit">(
    "enter",
  );
  const [imgError, setImgError] = useState<boolean[]>([false, false, false]);

  /* ─── IDE state (resets per slide) ─── */
  const [visibleLines, setVisibleLines] = useState(0);
  const [visibleComments, setVisibleComments] = useState(0);
  const [activeTab, setActiveTab] = useState<"code" | "tests">("code");
  const [elapsed, setElapsed] = useState(CANDIDATES[0].startElapsed);

  /* ── Slide sequencer ── */
  useEffect(() => {
    setSlidePhase("enter");
    const enterDone = setTimeout(() => setSlidePhase("idle"), 500);
    return () => clearTimeout(enterDone);
  }, [slideIndex]);

  useEffect(() => {
    const exitStart = setTimeout(() => {
      setSlidePhase("exit");
      setTimeout(() => {
        const next = (slideIndex + 1) % CANDIDATES.length;
        setSlideIndex(next);
        setElapsed(CANDIDATES[next].startElapsed);
        setVisibleLines(0);
        setVisibleComments(0);
        setActiveTab("code");
      }, 400);
    }, SLIDE_DURATION);
    return () => clearTimeout(exitStart);
  }, [slideIndex]);

  /* ── Code stream ── */
  useEffect(() => {
    if (visibleLines >= CODE_SNIPPET.length) return;
    const t = setTimeout(
      () => setVisibleLines((v) => v + 1),
      visibleLines === 0 ? 600 : 110,
    );
    return () => clearTimeout(t);
  }, [visibleLines]);

  /* ── Comments after code ── */
  useEffect(() => {
    if (
      visibleLines < CODE_SNIPPET.length ||
      visibleComments >= COMMENTS.length
    )
      return;
    const t = setTimeout(
      () => setVisibleComments((v) => v + 1),
      visibleComments === 0 ? 500 : 650,
    );
    return () => clearTimeout(t);
  }, [visibleLines, visibleComments]);

  /* ── Live timer ── */
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const candidate = CANDIDATES[slideIndex];
  const photo = CANDIDATE_PHOTOS[slideIndex];
  const hasPhoto = !imgError[slideIndex];

  const cardStyle: React.CSSProperties = {
    opacity: slidePhase === "idle" ? 1 : 0,
    transform:
      slidePhase === "enter"
        ? "translateY(12px) scale(0.99)"
        : slidePhase === "exit"
          ? "translateY(-8px) scale(0.99)"
          : "translateY(0) scale(1)",
    transition: "opacity 0.4s ease, transform 0.4s ease",
  };

  return (
    <div className="relative w-full h-full flex items-center justify-end pr-6 xl:pr-10">
      {/* Ambient glow */}
      <div
        className="absolute right-10 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ── Slide dot indicators (left edge) ── */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
        {CANDIDATES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setSlidePhase("exit");
              setTimeout(() => {
                setSlideIndex(i);
                setElapsed(CANDIDATES[i].startElapsed);
                setVisibleLines(0);
                setVisibleComments(0);
                setActiveTab("code");
              }, 350);
            }}
            className={`rounded-full transition-all duration-300 ${
              i === slideIndex
                ? "w-1.5 h-5 bg-emerald-400"
                : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
            }`}
            aria-label={`View candidate ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Main card ── */}
      <div
        className="relative w-[500px] flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#0c0c0e]"
        style={{
          ...cardStyle,
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* ── Progress bar ── */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5 z-10 overflow-hidden">
          <div
            className="h-full bg-emerald-500/60"
            style={{
              width: "100%",
              transformOrigin: "left",
              animation:
                slidePhase === "idle"
                  ? `progressBar ${SLIDE_DURATION}ms linear forwards`
                  : "none",
              transform: "scaleX(0)",
            }}
          />
        </div>

        {/* ── Session header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            {/* ── Photo / avatar ── */}
            <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/10">
              {hasPhoto ? (
                <Image
                  src={photo}
                  alt={candidate.name}
                  fill
                  className="object-cover object-top"
                  onError={() =>
                    setImgError((prev) => {
                      const next = [...prev];
                      next[slideIndex] = true;
                      return next;
                    })
                  }
                />
              ) : (
                /* Fallback initials avatar */
                <div className="w-full h-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">
                  {candidate.initials}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-white/90 leading-none">
                {candidate.name}
              </p>
              <p className="text-[11px] text-white/35 mt-0.5">
                {candidate.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase ${Colors.text.special} bg-emerald-500/10 border border-emerald-500/20`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
            <span className="text-sm font-mono text-white/40">
              {fmt(elapsed)}
            </span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-white/[0.07] px-4 bg-white/[0.01]">
          {(["code", "tests"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2.5 text-xs font-mono transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? `${Colors.text.special} border-emerald-500`
                  : "text-white/30 border-transparent hover:text-white/50"
              }`}
            >
              {tab === "code" ? "getUser.ts" : "test runner"}
            </button>
          ))}
          <div className="ml-auto flex items-center">
            <span className="text-[10px] text-white/20 font-mono">
              node 20 · ts 5.4
            </span>
          </div>
        </div>

        {/* ── Code pane ── */}
        {activeTab === "code" && (
          <div
            className="flex flex-1 overflow-hidden"
            style={{ minHeight: 280 }}
          >
            <div
              className="flex-1 overflow-auto py-4 text-[12px] leading-[1.7]"
              style={{
                fontFamily:
                  "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              }}
            >
              {CODE_SNIPPET.slice(0, visibleLines).map((line) => (
                <div
                  key={line.ln}
                  className={`flex items-start px-4 group transition-colors ${
                    line.flag === "warn"
                      ? "bg-yellow-500/[0.06] border-l-2 border-yellow-500/50"
                      : "border-l-2 border-transparent"
                  }`}
                >
                  <span className="w-7 shrink-0 text-white/15 select-none text-right mr-4 pt-px text-[11px]">
                    {line.ln}
                  </span>
                  <span className="flex flex-wrap">
                    {line.blank ? (
                      <span>&nbsp;</span>
                    ) : (
                      line.tokens.map((tok, ti) => (
                        <span
                          key={ti}
                          className={TOKEN_COLORS[tok.c] ?? "text-white/60"}
                        >
                          {tok.t}
                        </span>
                      ))
                    )}
                  </span>
                </div>
              ))}
              {visibleLines < CODE_SNIPPET.length && (
                <div className="px-4 flex items-center">
                  <span className="w-7 mr-4" />
                  <span
                    className={`inline-block w-[2px] h-4 ${Colors.text.special} animate-pulse`}
                  >
                    |
                  </span>
                </div>
              )}
            </div>

            {/* Comment thread */}
            <div className="w-[172px] shrink-0 border-l border-white/[0.07] flex flex-col bg-white/[0.01]">
              <p className="px-3 pt-3 pb-2 text-[9px] font-mono uppercase tracking-widest text-white/20">
                Comments
              </p>
              <div className="flex flex-col gap-2 px-2 pb-3 overflow-auto">
                {COMMENTS.slice(0, visibleComments).map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-lg p-2.5 text-[11px] leading-snug border flex flex-col gap-1 ${
                      c.type === "warn"
                        ? "border-yellow-500/25 bg-yellow-500/[0.07]"
                        : "border-emerald-500/25 bg-emerald-500/[0.07]"
                    }`}
                    style={{ animation: "slideIn 0.3s ease both" }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-mono uppercase tracking-wide ${c.type === "warn" ? "text-yellow-400/70" : "text-emerald-400/70"}`}
                      >
                        line {c.line}
                      </span>
                      <span className="text-[9px] text-white/25">
                        {c.author}
                      </span>
                    </div>
                    <p className="text-white/60 leading-snug">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Test runner pane ── */}
        {activeTab === "tests" && (
          <div
            className="py-4 px-5 flex flex-col gap-2.5"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              minHeight: 280,
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-white/30">
                vitest · last run 12s ago
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-mono">
                1 failed
              </span>
            </div>
            {TEST_RESULTS.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 shrink-0 text-sm ${r.pass ? "text-emerald-400" : "text-red-400"}`}
                >
                  {r.pass ? "✓" : "✗"}
                </span>
                <span
                  className={`text-[12px] leading-snug ${r.pass ? "text-white/50" : "text-white/80"}`}
                >
                  {r.label}
                </span>
                {!r.pass && (
                  <span className="ml-auto shrink-0 text-[10px] text-red-400/60 font-mono">
                    null ref
                  </span>
                )}
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-white/[0.07] flex items-center justify-between text-[11px] font-mono">
              <span className="text-white/25">
                4 tests · 3 passed · 1 failed
              </span>
              <span className="text-white/25">312ms</span>
            </div>
          </div>
        )}

        {/* ── Footer status bar ── */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.07] bg-white/[0.015] text-[10px] font-mono">
          <div className="flex items-center gap-3 text-white/25">
            <span>TypeScript</span>
            <span>·</span>
            <span>UTF-8</span>
            <span>·</span>
            <span>LF</span>
          </div>
          <span className={`${Colors.text.special} opacity-60`}>
            {visibleComments}/{COMMENTS.length} annotations
          </span>
        </div>
      </div>

      {/* ── Floating interviewer note ── */}
      <div
        className="absolute bottom-24 right-4 w-52 rounded-xl border border-white/10 bg-[#0f0f11] p-3 text-[11px] leading-snug"
        style={{
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          animation: "fadeUp 0.5s 2.8s ease both",
          opacity: 0,
        }}
      >
        <p className="text-white/25 font-mono text-[9px] uppercase tracking-wider mb-1.5">
          Interviewer note
        </p>
        <p className="text-white/55">
          Caught the missing null-check immediately — good instinct for
          defensive coding.
        </p>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes progressBar {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}
