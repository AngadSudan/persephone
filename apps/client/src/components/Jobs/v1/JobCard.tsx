"use client";

import { useRef, useState } from "react";
import { Job } from "./JobListingPage";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import { applyToJob } from "@/api/jobs/applyToJobs";
import toast from "react-hot-toast";

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const Colors = useColors();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    if (!resume) {
      fileInputRef.current?.click();
      toast.error("Choose resume first.");
      return;
    }

    try {
      setLoading(true);
      await applyToJob(job.id, resume);
      setApplied(true);
      toast.success("Applied successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Could not apply for this job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="premium-subtle-panel rounded-[1.5rem] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.05]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {job.organization.logo && (
          <img
            src={job.organization.logo}
            alt={job.organization.name}
            className="h-12 w-12 rounded-2xl object-cover ring-1 ring-white/10"
          />
        )}

        <div className="flex flex-col flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight">{job.jobRole}</h3>
            <span className="rounded-full border border-[#6BFBBF]/30 bg-[#6BFBBF]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6BFBBF]">
              {job.jobType}
            </span>
          </div>

          <p className={`mt-1 text-sm ${Colors.text.secondary}`}>
            {job.organization.name}
          </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-left md:min-w-44">
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">Compensation</p>
              <p className="mt-1 text-sm font-semibold">
            {job.payment}
          </p>
            </div>
          </div>

          <div className={`mt-3 flex flex-wrap gap-2 text-xs ${Colors.text.secondary}`}>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
            {new Date(job.startDate).toLocaleDateString()} -{" "}
            {new Date(job.endDate).toLocaleDateString()}
            </span>
            {job.interviewer?.name ? (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                Interviewer: {job.interviewer.name}
              </span>
            ) : null}
          </div>
          <p className={`mt-3 line-clamp-3 text-sm leading-6 ${Colors.text.secondary}`}>
            {job.jobDescription}
          </p>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.ppt"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file && file.size > 10 * 1024 * 1024) {
                  toast.error("Resume must be under 10MB.");
                  return;
                }
                setResume(file);
              }}
              className="hidden"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border border-white/14 bg-white/[0.04] px-4 py-2 text-xs font-medium hover:bg-white/[0.08]"
              >
                {resume ? "Change Resume" : "Upload Resume"}
              </button>
              {resume ? (
                <span className="text-xs text-white/45">{resume.name}</span>
              ) : (
                <span className="text-xs text-white/35">PDF, DOC, DOCX</span>
              )}
            </div>
            <button
              type="button"
              disabled={loading || applied}
              onClick={handleApply}
              className="rounded-full bg-[#6BFBBF] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-black shadow-[0_16px_30px_rgba(107,251,191,0.18)] disabled:opacity-60"
            >
              {loading ? "Applying..." : applied ? "Applied" : "Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
