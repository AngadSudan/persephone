"use client";

import { useState } from "react";
import { Job } from "./JobListingPage";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import { ExternalLink } from "lucide-react";
import { applyToJob } from "@/api/jobs/applyToJobs";

interface JobActionsProps {
  job: Job;
}

export default function JobActions({ job }: JobActionsProps) {
  const Colors = useColors();

  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const tags = [job.jobType, job.jobRole, job.organization].filter(Boolean);

  const handleApply = async () => {
    if (!resume) {
      alert("Please upload your resume before applying.");
      return;
    }

    try {
      setLoading(true);

      await applyToJob(job.id, resume);

      alert("Application submitted successfully!");

      setResume(null);
    } catch (error) {
      console.error("Failed to apply:", error);
      alert("Failed to apply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Job Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className={`
              px-3 py-1 text-sm rounded-full
              ${Colors.background.primary}
              ${Colors.text.secondary}
            `}
          >
            {typeof tag === "string" ? tag : tag.name}
          </span>
        ))}
      </div>

      {/* Resume Upload */}
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setResume(e.target.files[0]);
          }
        }}
        className="text-sm"
      />

      {/* Apply Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleApply}
          disabled={loading}
          className={`
            flex items-center gap-2
            px-6 py-2.5
            rounded-lg
            bg-blue-600
            text-white
            font-medium
            hover:bg-blue-700
            transition
            disabled:opacity-50
          `}
        >
          {loading ? "Applying..." : "Apply Now"}
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
}