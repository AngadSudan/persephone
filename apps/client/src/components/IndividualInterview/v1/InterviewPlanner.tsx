import React, { useMemo } from "react";
import { useColors } from "@/components/General/(Color Manager)/useColors";

type PlannerInterview = {
  id: string;
  scheduledAt: string;
};

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function InterviewPlanner({ interviews }: { interviews: PlannerInterview[] }) {
  const Colors = useColors();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const weekStartOffset = monthStart.getDay();

  const interviewsByDay = useMemo(() => {
    return interviews.reduce(
      (acc, interview) => {
        const date = new Date(interview.scheduledAt);
        if (isNaN(date.getTime())) return acc;
        const key = formatLocalDateKey(date);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [interviews]);

  return (
    <div
      className="premium-subtle-panel rounded-[1.5rem] p-5"
    >
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">Schedule</p>
          <h3 className={`mt-2 text-lg font-semibold ${Colors.text.primary}`}>
            Interview Planner
          </h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/55">
          {interviews.length} total
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-[11px] uppercase tracking-[0.18em] text-white/40">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: weekStartOffset }).map((_, index) => (
          <div key={`empty-${index}`} className="h-14 rounded-2xl bg-white/[0.03]" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const cellDate = new Date(now.getFullYear(), now.getMonth(), day);
          const key = formatLocalDateKey(cellDate);
          const count = interviewsByDay[key] || 0;
          const isToday = formatLocalDateKey(cellDate) === formatLocalDateKey(now);

          return (
            <div
              key={key}
              className={`h-14 rounded-2xl border px-2 py-2 text-xs transition-all ${
                isToday
                  ? "border-[#6BFBBF]/45 bg-[#6BFBBF]/10 shadow-[0_0_0_1px_rgba(107,251,191,0.08)]"
                  : "border-white/8 bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`${Colors.text.primary}`}>{day}</span>
                {count > 0 ? (
                  <span className="rounded-full bg-[#6BFBBF] px-1.5 py-0.5 text-[10px] font-semibold text-black">
                    {count}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InterviewPlanner;
