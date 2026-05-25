"use client";

import { useState, useEffect } from "react";
import JobListPanel from "./JobListPanel";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import { getAllJobs } from "@/api/jobs/getAllJobs";
import Sidebar from "@/components/General/Sidebar";

export interface Job {
  id: string;

  jobRole: string;
  jobDescription: string;

  jobType: "REMOTE" | "OFFLINE" | "HYBRID" | "FREELANCE";

  payment: string;

  startDate: string;
  endDate: string;

  createdAt: string;

  organization: {
    id: string;
    name: string;
    logo: string;
  };

  interviewer?: {
    name: string;
    headline?: string;
  };

  totalApplicants?: number;
}

export default function JobListingPage() {
  const Colors = useColors();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getAllJobs();
        setJobs(data);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className={`h-[calc(100vh-5.5rem)] w-full px-4 pb-4 ${Colors.background.primary}`}>
      <div className="grid h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-[18.5rem_minmax(0,1fr)]">
        <aside className="hidden h-full min-h-0 lg:block">
          <Sidebar />
        </aside>

        <section className="premium-panel h-full min-h-0 overflow-hidden rounded-[1.75rem]">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
              Loading jobs...
            </div>
          ) : (
            <JobListPanel jobs={jobs} />
          )}
        </section>
      </div>

    </div>
  );
}
