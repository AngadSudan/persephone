"use client";

import { useMemo, useState } from "react";
import JobCard from "./JobCard";
import { Job } from "./JobListingPage";
import { Search } from "lucide-react";

interface JobListPanelProps {
  jobs: Job[];
}

type JobTypeFilter = "ALL" | "REMOTE" | "HYBRID" | "OFFLINE" | "FREELANCE";

export default function JobListPanel({
  jobs,
}: JobListPanelProps) {
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState<JobTypeFilter>("ALL");
  const [organization, setOrganization] = useState("ALL");
  const [minApplicants, setMinApplicants] = useState("");
  const [payment, setPayment] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [startDateFrom, setStartDateFrom] = useState("");
  const [endDateTo, setEndDateTo] = useState("");

  const organizations = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.organization.name))),
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchText = `${job.jobRole} ${job.organization.name} ${job.jobDescription} ${
        job.interviewer?.name || ""
      } ${job.payment}`.toLowerCase();

      const searchMatch = search
        ? searchText.includes(search.toLowerCase())
        : true;
      const typeMatch = jobType === "ALL" ? true : job.jobType === jobType;
      const orgMatch =
        organization === "ALL" ? true : job.organization.name === organization;
      const paymentMatch = payment
        ? job.payment.toLowerCase().includes(payment.toLowerCase())
        : true;
      const interviewerMatch = interviewer
        ? (job.interviewer?.name || "")
            .toLowerCase()
            .includes(interviewer.toLowerCase())
        : true;
      const applicantMatch = minApplicants
        ? (job.totalApplicants || 0) >= Number(minApplicants)
        : true;

      const startMatch = startDateFrom
        ? new Date(job.startDate) >= new Date(startDateFrom)
        : true;
      const endMatch = endDateTo ? new Date(job.endDate) <= new Date(endDateTo) : true;

      return (
        searchMatch &&
        typeMatch &&
        orgMatch &&
        paymentMatch &&
        interviewerMatch &&
        applicantMatch &&
        startMatch &&
        endMatch
      );
    });
  }, [
    jobs,
    search,
    jobType,
    organization,
    payment,
    interviewer,
    minApplicants,
    startDateFrom,
    endDateTo,
  ]);

  const clearFilters = () => {
    setSearch("");
    setJobType("ALL");
    setOrganization("ALL");
    setMinApplicants("");
    setPayment("");
    setInterviewer("");
    setStartDateFrom("");
    setEndDateTo("");
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className="border-b border-white/10 p-4 sm:p-5"
      >
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">Opportunity Board</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Find your next role</h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/55">
            {filteredJobs.length} matching roles
          </div>
        </div>

        <div className="premium-subtle-panel grid grid-cols-1 gap-3 rounded-[1.5rem] p-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/15 px-3 py-3 md:col-span-2 xl:col-span-4">
            <Search size={16} className="text-neutral-400" />
            <input
              type="text"
              placeholder="Search role, org, interviewer, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/35"
            />
          </div>

          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value as JobTypeFilter)}
            className="rounded-2xl border border-white/10 bg-black/15 px-3 py-3 text-sm"
          >
            <option value="ALL">All Job Types</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="OFFLINE">Offline</option>
            <option value="FREELANCE">Freelance</option>
          </select>

          <select
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="rounded-2xl border border-white/10 bg-black/15 px-3 py-3 text-sm"
          >
            <option value="ALL">All Organizations</option>
            {organizations.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            placeholder="Payment contains..."
            className="rounded-2xl border border-white/10 bg-black/15 px-3 py-3 text-sm outline-none placeholder:text-white/35"
          />

          <input
            type="text"
            value={interviewer}
            onChange={(e) => setInterviewer(e.target.value)}
            placeholder="Interviewer name..."
            className="rounded-2xl border border-white/10 bg-black/15 px-3 py-3 text-sm outline-none placeholder:text-white/35"
          />

          <input
            type="number"
            min={0}
            value={minApplicants}
            onChange={(e) => setMinApplicants(e.target.value)}
            placeholder="Min applicants"
            className="rounded-2xl border border-white/10 bg-black/15 px-3 py-3 text-sm outline-none placeholder:text-white/35"
          />

          <input
            type="date"
            value={startDateFrom}
            onChange={(e) => setStartDateFrom(e.target.value)}
            className="rounded-2xl border border-white/10 bg-black/15 px-3 py-3 text-sm outline-none"
          />

          <input
            type="date"
            value={endDateTo}
            onChange={(e) => setEndDateTo(e.target.value)}
            className="rounded-2xl border border-white/10 bg-black/15 px-3 py-3 text-sm outline-none"
          />

          <button
            onClick={clearFilters}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm transition hover:bg-white/[0.08] md:col-span-2 xl:col-span-4"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="premium-scroll flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
        {!filteredJobs.length ? (
          <div className="premium-subtle-panel rounded-[1.5rem] p-8 text-center text-sm text-white/70">
            No jobs match the selected filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}
