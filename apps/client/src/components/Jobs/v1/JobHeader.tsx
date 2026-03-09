"use client";

import { Job } from "./JobListingPage";
import { useColors } from "@/components/General/(Color Manager)/useColors";

interface JobHeaderProps {
  job: Job;
}

export default function JobHeader({ job }: JobHeaderProps) {
  const Colors = useColors();

  return (
    <div className="flex items-start gap-4">
      {job.organization.logo && (
        <img
          src={job.organization.logo}
          alt={job.organization.name}
          className="w-14 h-14 rounded-md object-cover"
        />
      )}

      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold">{job.jobRole}</h1>

        <p className={`${Colors.text.secondary}`}>
          {job.organization.name}
        </p>

        <p className={`text-sm ${Colors.text.secondary}`}>
          {job.jobType}
        </p>

        <div className="text-sm mt-1 flex gap-2 flex-wrap">
          <span>{job.payment}</span>
          <span>•</span>
          <span>{job.totalApplicants ?? 0} applicants</span>
          <span>•</span>
          <span>Posted {job.createdAt}</span>
        </div>
      </div>
    </div>
  );
}