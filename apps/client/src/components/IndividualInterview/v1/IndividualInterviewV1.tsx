import { useColors } from "@/components/General/(Color Manager)/useColors";
import Sidebar from "@/components/General/Sidebar";
import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useMemo, useState } from "react";
import Filter, { InterviewFilters } from "./Filter";
import Interviews from "./Interviews";
import InterviewPlanner from "./InterviewPlanner";

type InterviewItem = {
  id: string;
  slug: string;
  createdAt: string;
  interviewStatus: "PENDING" | "UNDER_PROGRESS" | "COMPLETED" | string;
  interviewer?: {
    name?: string;
  } | null;
  interviewRound?: {
    name?: string;
  } | null;
  scheduledAt: string;
};

function IndividualInterviewV1() {
  const Colors = useColors();
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [filter, setFilter] = useState<InterviewFilters>({
    search: "",
    startDate: "",
    status: "ALL",
    timeframe: "ALL",
  });
  const [loading, setLoading] = useState(false);

  const filteredInterviews = useMemo(() => {
    let data = [...interviews];
    const now = new Date();

    if (filter.search) {
      const query = filter.search.toLowerCase();

      data = data.filter((item) => {
        const interviewerName = item?.interviewer?.name?.toLowerCase() || "";
        const roundName = item?.interviewRound?.name?.toLowerCase() || "";
        return interviewerName.includes(query) || roundName.includes(query);
      });
    }

    if (filter.startDate) {
      const selectedDate = new Date(filter.startDate);
      selectedDate.setHours(0, 0, 0, 0);

      data = data.filter((item) => {
        const interviewDate = new Date(item.scheduledAt);
        interviewDate.setHours(0, 0, 0, 0);
        return interviewDate >= selectedDate;
      });
    }

    if (filter.status !== "ALL") {
      data = data.filter((item) => item.interviewStatus === filter.status);
    }

    if (filter.timeframe !== "ALL") {
      data = data.filter((item) => {
        const interviewDate = new Date(item.scheduledAt);
        if (filter.timeframe === "UPCOMING") return interviewDate > now;
        if (filter.timeframe === "CURRENT")
          return (
            item.interviewStatus === "UNDER_PROGRESS" ||
            interviewDate.toDateString() === now.toDateString()
          );
        return true;
      });
    }

    return data;
  }, [filter, interviews]);

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/api/v1/interview/interview-suite/interview/get-all-user-interview`,
        );

        const rawData: unknown[] = Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
        const normalized: InterviewItem[] = rawData.map((item) => {
          const interview = item as Partial<InterviewItem> & {
            interviewRound?: { suite?: { startDate?: string } };
          };

          return {
            id: interview.id || "",
            slug: interview.slug || "",
            createdAt: interview.createdAt || "",
            interviewStatus: interview.interviewStatus || "PENDING",
            interviewer: interview.interviewer || null,
            interviewRound: interview.interviewRound || null,
            scheduledAt:
              interview?.interviewRound?.suite?.startDate ||
              interview?.createdAt ||
              new Date().toISOString(),
          };
        });

        setInterviews(normalized);
      } catch (error) {
        console.error("Unable to fetch interviews", error);
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchInterviews();
  }, []);

  return (
    <div
      className={`h-[calc(100vh-5.5rem)] w-full overflow-hidden px-4 pb-4 ${Colors.background.primary}`}
    >
      <div className="grid h-full min-h-0 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-[18.5rem_minmax(0,1fr)]">
        <div className="hidden h-full min-h-0 xl:block">
          <Sidebar />
        </div>

        <div className="premium-panel premium-scroll h-full min-h-0 space-y-4 overflow-y-auto rounded-[1.75rem] p-4 sm:p-5">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">Interview Dashboard</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">Current and upcoming interviews</h1>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs text-white/55">
              {filteredInterviews.length} visible interviews
            </div>
          </div>
          <Filter filter={filter} setFilter={setFilter} />

          {loading ? (
            <div
              className={`premium-subtle-panel w-full rounded-[1.5rem] p-6 text-center ${Colors.text.secondary}`}
            >
              Loading interviews...
            </div>
          ) : null}

          <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.5fr)_24rem]">
            <Interviews data={filteredInterviews} />
            <InterviewPlanner interviews={filteredInterviews} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default IndividualInterviewV1;
