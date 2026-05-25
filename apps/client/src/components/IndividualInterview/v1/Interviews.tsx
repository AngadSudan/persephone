import React from "react";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import Link from "next/link";

type InterviewItem = {
  id: string;
  slug: string;
  interviewStatus: "PENDING" | "UNDER_PROGRESS" | "COMPLETED" | string;
  scheduledAt: string;
  interviewer?: {
    name?: string;
  } | null;
  interviewRound?: {
    name?: string;
  } | null;
};

function Interviews({ data }: { data: InterviewItem[] }) {
  const Colors = useColors();

  if (!data || data.length === 0) {
    return (
      <div
        className={`w-full p-6 text-center rounded-xl ${Colors.background.secondary} ${Colors.text.secondary} ${Colors.border.fadedThin}`}
      >
        No interviews found
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {data.map((item, index) => (
        <div
          key={item.id || index}
          className="premium-subtle-panel flex flex-col gap-4 rounded-[1.5rem] p-5 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
            <p className={`${Colors.text.primary} text-lg font-semibold tracking-tight`}>
              {item?.interviewer?.name || "Unknown Interviewer"}
            </p>
              <span className="rounded-full border border-[#6BFBBF]/25 bg-[#6BFBBF]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6BFBBF]">
                {item?.interviewStatus.replace("_", " ")}
              </span>
            </div>

            <p className={`text-sm ${Colors.text.secondary}`}>
              {item?.interviewRound?.name || "Interview Round"}
            </p>

            <p className={`text-sm ${Colors.text.secondary}`}>
              {new Date(item.scheduledAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/interview/${item.slug || item.id}`}
              className="rounded-full bg-[#6BFBBF] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-black shadow-[0_16px_30px_rgba(107,251,191,0.18)]"
            >
              Join
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Interviews;
