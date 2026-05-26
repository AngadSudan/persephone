import { useColors } from "@/components/General/(Color Manager)/useColors";
import React from "react";
import FailedToFetch from "./FailedToFetch";

function LeetCodeCard({ url, data }: { url: string; data: any }) {
  const colors = useColors();

  if (!data)
    return (
      <FailedToFetch
        message={"Failed to fetch Data"}
        onRetry={() => window.location.replace(new URL(url))}
      />
    );

  const {
    user,
    languagesSolved,
    contestStats,
    badges,
    contestHistory,
    activity,
  } = data;

  return (
    <div
      className={`
        max-w-5xl mx-auto rounded-2xl p-6 space-y-8
        ${colors.background.primary}
        ${colors.text.primary}
      `}
    >
      {/* ================= PROFILE ================= */}
      <div
        className={`
          flex flex-col md:flex-row items-center md:items-start gap-5
          p-6 rounded-2xl
          bg-[#1a1a1a]
          border border-[#2f2f2f]
        `}
      >
        <img
          src={user.avatar}
          alt={user.username}
          className="
            w-20 h-20 rounded-full border-4
            border-[#FFA116]
            shadow-lg
          "
        />

        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-white">{user.realName}</h2>

          <p className="text-[#FFA116] font-medium">@{user.username}</p>

          <p className="text-sm text-gray-400">
            Global Rank:{" "}
            <span className="text-white font-semibold">{user.ranking}</span>
          </p>
        </div>
      </div>

      {/* ================= CONTEST STATS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Rating"
          value={contestStats.rating}
          accent="text-[#FFA116]"
        />

        <Stat
          label="Contests"
          value={contestStats.attendedContests}
          accent="text-blue-400"
        />

        <Stat
          label="Global Rank"
          value={contestStats.globalRanking}
          accent="text-green-400"
        />

        <Stat
          label="Top %"
          value={contestStats.topPercentage}
          accent="text-pink-400"
        />
      </div>

      {/* ================= LANGUAGES ================= */}
      <Section title="Languages Solved">
        <div className="flex flex-wrap gap-3">
          {Object.entries(languagesSolved).map(([lang]) => (
            <span
              key={lang}
              className="
                px-4 py-2 rounded-xl text-sm font-medium
                bg-[#2a2a2a]
                border border-[#3a3a3a]
                text-[#FFA116]
              "
            >
              {lang}: {languagesSolved[lang] || 0}
            </span>
          ))}
        </div>
      </Section>

      {/* ================= BADGES ================= */}
      <Section title="Badges">
        <div className="flex flex-wrap gap-3">
          {badges.map((b: any, i: number) => (
            <div
              key={i}
              className="
                px-4 py-2 rounded-xl text-sm font-medium
                bg-[#2d2416]
                border border-[#FFA116]/30
                text-[#FFA116]
              "
            >
              🏅 {b.name}
            </div>
          ))}
        </div>
      </Section>

      {/* ================= ACTIVITY ================= */}
      <Section title="Activity">
        <div className="grid sm:grid-cols-3 gap-4">
          <ActivityCard title="🔥 Streak" value={activity.streak} />

          <ActivityCard
            title="📅 Active Days"
            value={activity.totalActiveDays}
          />

          <ActivityCard
            title="🗓 Years"
            value={activity.activeYears.join(", ")}
          />
        </div>
      </Section>

      {/* ================= CONTEST HISTORY ================= */}
      <Section title="Recent Contests">
        <div
          className="
            overflow-x-auto rounded-2xl
            border border-[#2f2f2f]
          "
        >
          <table className="w-full text-sm">
            <thead className="bg-[#1f1f1f] text-gray-300">
              <tr>
                <th className="p-4 text-left">Contest</th>
                <th className="p-4 text-center">Solved</th>
                <th className="p-4 text-center">Rank</th>
                <th className="p-4 text-center">Rating</th>
              </tr>
            </thead>

            <tbody>
              {contestHistory.slice(-5).map((c: any, i: number) => (
                <tr
                  key={i}
                  className="
                    border-t border-[#2f2f2f]
                    hover:bg-[#1a1a1a]
                    transition
                  "
                >
                  <td className="p-4 text-white">{c.contestName}</td>

                  <td className="text-center text-gray-300">
                    {c.problemsSolved}/{c.totalProblems}
                  </td>

                  <td className="text-center text-gray-300">{c.ranking}</td>

                  <td
                    className={`
                      text-center font-semibold
                      ${c.trend === "UP" ? "text-green-400" : "text-red-400"}
                    `}
                  >
                    {c.rating}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3
        className="
          text-xl font-bold
          text-[#FFA116]
          border-l-4 border-[#FFA116]
          pl-3
        "
      >
        {title}
      </h3>

      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: any;
  accent?: string;
}) {
  return (
    <div
      className="
        rounded-2xl p-5
        bg-[#1f1f1f]
        border border-[#2f2f2f]
        text-center
      "
    >
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>

      <div className="text-xs uppercase tracking-wide text-gray-400 mt-1">
        {label}
      </div>
    </div>
  );
}

function ActivityCard({ title, value }: { title: string; value: any }) {
  return (
    <div
      className="
        rounded-2xl p-4
        bg-[#1f1f1f]
        border border-[#2f2f2f]
      "
    >
      <div className="text-sm text-gray-400 mb-1">{title}</div>

      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

export default LeetCodeCard;
