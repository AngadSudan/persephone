"use client";

import { Job } from "./JobListingPage";
import { useColors } from "@/components/General/(Color Manager)/useColors";

interface JobDescriptionProps {
  job: Job;
}

export default function JobDescription({ job }: JobDescriptionProps) {
  const Colors = useColors();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">About the job</h2>

      <p className={`${Colors.text.secondary}`}>
        {job.jobDescription}
      </p>

      <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
        <div className={`rounded-lg border border-white/10 p-3 ${Colors.background.primary}`}>
          <p className="text-white/60">Job Type</p>
          <p>{job.jobType}</p>
        </div>
        <div className={`rounded-lg border border-white/10 p-3 ${Colors.background.primary}`}>
          <p className="text-white/60">Compensation</p>
          <p>{job.payment}</p>
        </div>
        <div className={`rounded-lg border border-white/10 p-3 ${Colors.background.primary}`}>
          <p className="text-white/60">Start Date</p>
          <p>{new Date(job.startDate).toLocaleDateString()}</p>
        </div>
        <div className={`rounded-lg border border-white/10 p-3 ${Colors.background.primary}`}>
          <p className="text-white/60">End Date</p>
          <p>{new Date(job.endDate).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
