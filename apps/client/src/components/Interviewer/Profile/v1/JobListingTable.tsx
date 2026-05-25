"use client";

import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import {
  Calendar,
  ChevronRight,
  Eye,
  Search,
  Briefcase,
  FileText,
  IndianRupee,
  Tag,
  X,
} from "lucide-react";

type JobListing = {
  id: string;
  jobRole: string;
  jobDescription: string;
  jobType: "REMOTE" | "OFFLINE" | "HYBRID" | "FREELANCE";
  payment: string;
  startDate: string;
  endDate: string;
};

type InterviewerProfile = {
  jobListings: JobListing[];
};

function Pill({ children }: { children: React.ReactNode }) {
  const Colors = useColors();
  return (
    <span
      className={`text-sm px-2 py-0.5 rounded-full ${Colors.background.special} ${Colors.text.inverted} font-mono font-semibold`}
    >
      {children}
    </span>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const Colors = useColors();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,19,19,0.85)] backdrop-blur-[6px] font-mono"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0 0 60px #64e5af15, 0 24px 48px rgba(0,0,0,0.6)",
          animation: "modalIn 0.2s cubic-bezier(.22,1,.36,1)",
        }}
        className={`w-110 rounded-2xl p-7 relative ${Colors.background.secondary} ${Colors.text.primary}`}
      >
        {children}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  const Colors = useColors();
  return (
    <div className="space-y-1.5 font-mono">
      <label
        style={{ fontSize: "0.72rem", fontFamily: "'DM Mono', monospace" }}
        className={`block ${Colors.text.special}`}
      >
        {label}
      </label>
      <div
        className={`flex items-center gap-3 rounded-xl px-4 py-3 ${Colors.background.primary} ${Colors.text.primary} ${Colors.border.specialThin}`}
      >
        <Icon
          size={15}
          className={`shrink-0 opacity-70 ${Colors.text.special}`}
        />
        <span className="text-sm wrap-break-word">{value}</span>
      </div>
    </div>
  );
}

export default function JobListingTable() {
  const Colors = useColors();
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedJobListing, setSelectedJobListing] =
    useState<JobListing | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchJobListings() {
      try {
        const res = await axiosInstance.get(
          "/api/v1/interviewers/get-profile",
          { withCredentials: true },
        );
        const profile = res.data?.data as InterviewerProfile | undefined;
        const listings = Array.isArray(profile?.jobListings)
          ? profile!.jobListings
          : [];

        if (mounted) {
          setJobListings(listings);
        }
      } catch (error) {
        console.error("Failed to fetch interviewer job listings", error);
        if (mounted) {
          setJobListings([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void fetchJobListings();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      jobListings.filter((job) =>
        `${job.jobRole} ${job.jobType} ${job.payment} ${job.jobDescription}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [jobListings, search],
  );

  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-4 rounded-2xl font-mono ${Colors.background.primary}`}
        style={{ minHeight: 300 }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: "2px solid #64e5af30",
            borderTop: "2px solid #64e5af",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p
          style={{ fontSize: "0.75rem" }}
          className={`${Colors.text.special} opacity-80`}
        >
          loading job listings...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="space-y-5 mono font-mono">
      <div className="flex items-center justify-between gap-2 mono font-mono">
        <div
          className={`${Colors.background.primary} ${Colors.text.primary} rounded-md flex items-center gap-2.5 px-3.5 py-2.25 w-full transition-colors duration-200`}
        >
          <Search
            className={`${Colors.text.special}`}
            size={14}
            style={{ opacity: 0.6, flexShrink: 0 }}
          />
          <input
            placeholder="Search job listings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: "transparent",
              fontSize: "0.84rem",
              outline: "none",
              width: "100%",
              fontFamily: "inherit",
            }}
            className={`font-mono placeholder:text-white/25 ${Colors.text.primary}`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="cursor-pointer opacity-40 hover:opacity-70"
            >
              <X
                size={22}
                className="hover:text-red-700 transition-colors duration-100 active:scale-90 cursor-pointer"
              />
            </button>
          )}
        </div>
      </div>

      <div
        style={{ borderRadius: "18px", overflow: "hidden" }}
        className={`${Colors.background.secondary} ${Colors.border.defaultThin}`}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1.5fr 1.5fr 100px",
            padding: "12px 20px",
          }}
          className={`${Colors.border.defaultThinBottom} ${Colors.background.primary} ${Colors.text.primary} font-mono font-semibold`}
        >
          {["Job Role", "Type", "Payment", "Duration", ""].map((h, i) => (
            <span
              key={i}
              className="iv-tag-header font-mono"
              style={{ textAlign: i === 4 ? "right" : "left" }}
            >
              {h}
            </span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div
            style={{ padding: "48px 24px", textAlign: "center" }}
            className={`${Colors.text.primary} opacity-40`}
          >
            <p className="font-mono" style={{ fontSize: "0.8rem" }}>
              no job listings found
            </p>
          </div>
        ) : (
          filtered.map((jl, idx) => (
            <div
              key={jl.id}
              onClick={() => setSelectedJobListing(jl)}
              className={`iv-row cursor-pointer transition-colors font-mono ${Colors.text.primary} ${Colors.hover.special} ${idx < filtered.length - 1 ? Colors.border.specialThinBottom : ""}`}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1.5fr 1.5fr 100px",
                padding: "14px 20px",
                alignItems: "center",
                animationDelay: `${idx * 40}ms`,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">{jl.jobRole}</span>
                <ChevronRight
                  size={13}
                  className="iv-chevron"
                  color="#64e5af"
                />
              </div>

              <div>
                <Pill>{jl.jobType}</Pill>
              </div>

              <span
                style={{ fontSize: "0.84rem" }}
                className={`${Colors.text.primary} opacity-70`}
              >
                ₹{jl.payment}
              </span>

              <span
                style={{ fontSize: "0.84rem" }}
                className={`${Colors.text.primary} opacity-70`}
              >
                {new Date(jl.startDate).toLocaleDateString()} -{" "}
                {new Date(jl.endDate).toLocaleDateString()}
              </span>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedJobListing(jl);
                  }}
                  className="iv-btn iv-btn-ghost cursor-pointer"
                  title="View"
                >
                  <Eye
                    size={22}
                    className="hover:text-gray-400 transition-colors duration-100 active:scale-90 cursor-pointer"
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedJobListing ? (
        <Modal onClose={() => setSelectedJobListing(null)}>
          <button
            onClick={() => setSelectedJobListing(null)}
            style={{ position: "absolute", top: 18, right: 18 }}
            className={`cursor-pointer transition-colors ${Colors.text.primary} opacity-40 hover:opacity-100`}
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-4 mb-6 font-mono">
            <div
              style={{
                width: 52,
                height: 52,
                background: "linear-gradient(135deg,#64e5af22,#64e5af44)",
                border: "1px solid #64e5af55",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
              className={`${Colors.text.special}`}
            >
              {selectedJobListing.jobRole
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "1rem" }}>
                {selectedJobListing.jobRole}
              </p>
              <p
                style={{ fontSize: "0.75rem" }}
                className={`${Colors.text.special} opacity-80`}
              >
                {selectedJobListing.jobType}
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6 font-mono">
            <Field
              icon={Briefcase}
              label="Job Role"
              value={selectedJobListing.jobRole}
            />
            <Field
              icon={FileText}
              label="Job Description"
              value={selectedJobListing.jobDescription}
            />
            <Field
              icon={IndianRupee}
              label="Payment"
              value={`₹${selectedJobListing.payment}`}
            />
            <Field
              icon={Tag}
              label="Job Type"
              value={selectedJobListing.jobType}
            />
            <Field
              icon={Calendar}
              label="Start Date"
              value={new Date(
                selectedJobListing.startDate,
              ).toLocaleDateString()}
            />
            <Field
              icon={Calendar}
              label="End Date"
              value={new Date(selectedJobListing.endDate).toLocaleDateString()}
            />
          </div>

          <div className="flex justify-end gap-3 font-mono">
            <button
              onClick={() => setSelectedJobListing(null)}
              className={` ${Colors.text.primary} ${Colors.properties.interactiveButton} ${Colors.border.defaultThin} font-semibold flex items-center gap-2 px-2 py-2 rounded-lg font-mono`}
            >
              Close
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
