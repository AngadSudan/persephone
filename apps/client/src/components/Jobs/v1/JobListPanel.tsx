"use client";

import { useState, useRef, useEffect } from "react";
import JobCard from "./JobCard";
import { Job } from "./JobListingPage";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

interface JobListPanelProps {
  jobs: Job[];
  selectedJob: Job | null;
  setSelectedJob: (jobId: string) => void;
}

export default function JobListPanel({
  jobs,
  selectedJob,
  setSelectedJob,
}: JobListPanelProps) {
  const Colors = useColors();

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "ALL" | "REMOTE" | "HYBRID" | "OFFLINE" | "FREELANCE"
  >("ALL");

  const [roleFilter, setRoleFilter] = useState("ALL");
  const [salaryFilter, setSalaryFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [openRole, setOpenRole] = useState(false);
  const [openSalary, setOpenSalary] = useState(false);
  const [openType, setOpenType] = useState(false);

  const [visibleJobs, setVisibleJobs] = useState(10)
const listRef = useRef<HTMLDivElement | null>(null)

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenRole(false);
        setOpenSalary(false);
        setOpenType(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = `${job.jobRole} ${job.organization.name}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesType = filter === "ALL" ? true : job.jobType === filter;

    return matchesSearch && matchesType;
  });

  useEffect(() => {
  const el = listRef.current

  const handleScroll = () => {
    if (!el) return

    const bottom =
      el.scrollHeight - el.scrollTop <= el.clientHeight + 100

    if (bottom) {
      setVisibleJobs((prev) => prev + 10)
    }
  }

  el?.addEventListener("scroll", handleScroll)

  return () => el?.removeEventListener("scroll", handleScroll)
}, []);

  return (
    <div className={`h-full flex flex-col ${Colors.border.defaultThinRight}`}>
      
      {/* SEARCH + FILTERS */}
      <div
        className={`
        p-4
        flex flex-wrap items-center gap-2
        ${Colors.background.secondary}
        border-b border-neutral-700
        z-20
      `}
      >
        {/* SEARCH */}
        <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-md border border-neutral-700 bg-neutral-900">
          <Search size={14} className="text-neutral-400" />

          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1"
          />
        </div>

        <div className="flex items-center gap-2" ref={dropdownRef}>
          
          {/* ROLE FILTER */}
          <div className="relative">
            <button
              onClick={() => setOpenRole((p) => !p)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md
                ${Colors.background.secondary} ${Colors.text.primary}
                text-sm font-medium border border-neutral-700
                hover:border-neutral-500 transition
              `}
            >
              {roleFilter === "ALL"
                ? "Role"
                : roleFilter.replace("_", " ")}
              {openRole ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {openRole && (
              <div
                className={`
                  absolute mt-2 w-44 rounded-xl
                  ${Colors.background.secondary}
                  border ${Colors.border.defaultThick}
                  shadow-lg overflow-hidden z-50
                `}
              >
                {["ALL", "FULL_TIME", "PART_TIME", "INTERN", "CONTRACT"].map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setRoleFilter(item);
                        setOpenRole(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-white/5"
                    >
                      {item === "ALL" ? "All Roles" : item.replace("_", " ")}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* SALARY FILTER */}
          <div className="relative">
            <button
              onClick={() => setOpenSalary((p) => !p)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md
                ${Colors.background.secondary} ${Colors.text.primary}
                text-sm font-medium border border-neutral-700
                hover:border-neutral-500 transition
              `}
            >
              {salaryFilter === "ALL" ? "Salary" : salaryFilter}
              {openSalary ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {openSalary && (
              <div
                className={`
                  absolute mt-2 w-44 rounded-xl
                  ${Colors.background.secondary}
                  border ${Colors.border.defaultThick}
                  shadow-lg overflow-hidden z-50
                `}
              >
                {[
                  "ALL",
                  "$0 - $50k",
                  "$50k - $100k",
                  "$100k - $150k",
                  "$150k+",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSalaryFilter(item);
                      setOpenSalary(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-white/5"
                  >
                    {item === "ALL" ? "All Salaries" : item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TYPE FILTER (CONNECTED TO EXISTING LOGIC) */}
          <div className="relative">
            <button
              onClick={() => setOpenType((p) => !p)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md
                ${Colors.background.secondary} ${Colors.text.primary}
                text-sm font-medium border border-neutral-700
                hover:border-neutral-500 transition
              `}
            >
              {filter === "ALL"
                ? "Type"
                : filter.charAt(0) + filter.slice(1).toLowerCase()}

              {openType ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {openType && (
              <div
                className={`
                  absolute mt-2 w-44 rounded-xl
                  ${Colors.background.secondary}
                  border ${Colors.border.defaultThick}
                  shadow-lg overflow-hidden z-50
                `}
              >
                {[
                  { label: "All Types", value: "ALL" },
                  { label: "Remote", value: "REMOTE" },
                  { label: "Hybrid", value: "HYBRID" },
                  { label: "Offline", value: "OFFLINE" },
                  { label: "Freelance", value: "FREELANCE" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      setFilter(item.value as any);
                      setOpenType(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-white/5"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* JOB LIST */}
      <div
  ref={listRef}
  className="flex-1 overflow-y-auto p-4 space-y-3"
>
        {filteredJobs.slice(0, visibleJobs).map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSelected={selectedJob?.id === job.id}
            onSelect={() => setSelectedJob(job.id)}
          />
        ))}
      </div>
    </div>
  );
}