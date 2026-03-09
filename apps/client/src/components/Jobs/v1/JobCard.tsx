"use client";

import { Job } from "./JobListingPage";
import { useColors } from "@/components/General/(Color Manager)/useColors";

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onSelect: () => void;
}

export default function JobCard({ job, isSelected, onSelect }: JobCardProps) {
  const Colors = useColors();

  return (
    <div
      onClick={onSelect}
      className={`
        p-4 rounded-lg
        cursor-pointer
        transition
        ${Colors.border.fadedThin}
        ${Colors.background.secondary}
        ${Colors.properties.interactiveButton}
        ${isSelected ? Colors.border.specialThick : ""}
      `}
    >
      <div className="flex gap-3 items-start">
        {job.organization.logo && (
          <img
            src={job.organization.logo}
            alt={job.organization.name}
            className="w-10 h-10 rounded-md object-cover"
          />
        )}

        <div className="flex flex-col flex-1">
          <h3 className="font-semibold text-sm">{job.jobRole}</h3>

          <p className={`text-xs ${Colors.text.secondary}`}>
            {job.organization.name}
          </p>

          <p className={`text-xs ${Colors.text.secondary}`}>
            {job.jobType}
          </p>

          <p className="text-xs mt-1 font-medium">
            {job.payment}
          </p>
        </div>
      </div>
    </div>
  );
}