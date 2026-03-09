"use client";

import { Job } from "./JobListingPage";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import JobHeader from "./JobHeader";
import JobActions from "./JobActions";
import JobDescription from "./JobDescription";

interface JobDetailsPanelProps {
  job: Job | null;
}

export default function JobDetailsPanel({ job }: JobDetailsPanelProps) {
  const Colors = useColors();

  if (!job) {
    return (
      <div
        className={`
        h-full flex flex-col items-center justify-center
        text-neutral-400
        ${Colors.background.secondary}
      `}
      >
        <div className="text-lg font-medium mb-2">No Job Selected</div>
        <p className="text-sm text-neutral-500">
          Select a job from the list to view details
        </p>
      </div>
    );
  }

  return (
    <div
      className={`
        h-full flex flex-col
        ${Colors.background.secondary}
      `}
    >
      {/* HEADER (Sticky) */}
      <div
        className="
        z-10
        p-6"
      >
        <JobHeader job={job} />
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* ACTIONS */}
        <div>
          <JobActions job={job} />
        </div>

        {/* DESCRIPTION */}
        <div
          className="
          p-6
          rounded-xl"
        >
          <JobDescription job={job} />
        </div>

      </div>
    </div>
  );
}