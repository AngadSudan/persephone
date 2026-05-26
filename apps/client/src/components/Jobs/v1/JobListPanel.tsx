"use client";

import { useMemo, useState } from "react";
import {
  Briefcase,
  Building2,
  CalendarDays,
  DollarSign,
  Search,
  User2,
  Users,
  X,
  ChevronDown,
} from "lucide-react";

import JobCard from "./JobCard";
import { Job } from "./JobListingPage";

interface JobListPanelProps {
  jobs: Job[];
}

type JobTypeFilter = "ALL" | "REMOTE" | "HYBRID" | "OFFLINE" | "FREELANCE";

export default function JobListPanel({ jobs }: JobListPanelProps) {
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
      const searchText = `${job.jobRole} ${job.organization.name} ${
        job.jobDescription
      } ${job.interviewer?.name || ""} ${job.payment}`.toLowerCase();

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

      const endMatch = endDateTo
        ? new Date(job.endDate) <= new Date(endDateTo)
        : true;

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

  const filterBaseClass =
    "flex h-12 w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white transition focus-within:border-white/20 focus-within:bg-black/30";

  const inputClass =
    "w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35";

  const selectClass =
    "h-full w-full appearance-none bg-transparent pr-8 text-sm text-white outline-none";

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-white/10 p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">
              Opportunity Board
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Find your next role
            </h2>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/55">
            {filteredJobs.length} matching roles
          </div>
        </div>

        <div className="premium-subtle-panel grid grid-cols-1 gap-3 rounded-3xl p-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Search */}
          <div className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 md:col-span-2 xl:col-span-4">
            <Search size={18} className="shrink-0 text-neutral-400" />

            <input
              type="text"
              placeholder="Search role, org, interviewer, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            />
          </div>

          {/* Job Type */}
          <div className={filterBaseClass}>
            <Briefcase size={18} className="shrink-0 text-neutral-400" />

            <div className="relative flex-1">
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobTypeFilter)}
                className={selectClass}
              >
                <option value="ALL" className="bg-neutral-900 text-white">
                  All Job Types
                </option>

                <option value="REMOTE" className="bg-neutral-900 text-white">
                  Remote
                </option>

                <option value="HYBRID" className="bg-neutral-900 text-white">
                  Hybrid
                </option>

                <option value="OFFLINE" className="bg-neutral-900 text-white">
                  Offline
                </option>

                <option value="FREELANCE" className="bg-neutral-900 text-white">
                  Freelance
                </option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400"
              />
            </div>
          </div>

          {/* Organization */}
          <div className={filterBaseClass}>
            <Building2 size={18} className="shrink-0 text-neutral-400" />

            <div className="relative flex-1">
              <select
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className={selectClass}
              >
                <option value="ALL" className="bg-neutral-900 text-white">
                  All Organizations
                </option>

                {organizations.map((org) => (
                  <option
                    key={org}
                    value={org}
                    className="bg-neutral-900 text-white"
                  >
                    {org}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400"
              />
            </div>
          </div>

          {/* Payment */}
          <div className={filterBaseClass}>
            <DollarSign size={18} className="shrink-0 text-neutral-400" />

            <input
              type="text"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              placeholder="Payment contains..."
              className={inputClass}
            />
          </div>

          {/* Interviewer */}
          <div className={filterBaseClass}>
            <User2 size={18} className="shrink-0 text-neutral-400" />

            <input
              type="text"
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
              placeholder="Interviewer name..."
              className={inputClass}
            />
          </div>

          {/* Applicants */}
          <div className={filterBaseClass}>
            <Users size={18} className="shrink-0 text-neutral-400" />

            <input
              type="number"
              min={0}
              value={minApplicants}
              onChange={(e) => setMinApplicants(e.target.value)}
              placeholder="Min applicants"
              className={inputClass}
            />
          </div>

          {/* Start Date */}
          <div className={filterBaseClass}>
            <CalendarDays size={18} className="shrink-0 text-neutral-400" />

            <input
              type="date"
              value={startDateFrom}
              onChange={(e) => setStartDateFrom(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
            />
          </div>

          {/* End Date */}
          <div className={filterBaseClass}>
            <CalendarDays size={18} className="shrink-0 text-neutral-400" />

            <input
              type="date"
              value={endDateTo}
              onChange={(e) => setEndDateTo(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
            />
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08] md:col-span-2 xl:col-span-4"
          >
            <X size={16} />
            Clear Filters
          </button>
        </div>
      </div>

      <div className="premium-scroll flex-1 space-y-4 p-4 sm:p-5">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}

        {!filteredJobs.length ? (
          <div className="premium-subtle-panel rounded-3xl p-8 text-center text-sm text-white/70">
            No jobs match the selected filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}
