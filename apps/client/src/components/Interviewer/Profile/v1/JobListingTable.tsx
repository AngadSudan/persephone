"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronRight,
  Eye,
  Pencil,
  Search,
  Briefcase,
  FileText,
  IndianRupee,
  Tag,
  Trash2,
  X,
  Plus,
} from "lucide-react";

type JobListing = {
  id: string;
  jobRole: string;
  jobDescription: string;
  jobType: "REMOTE" | "OFFLINE" | "HYBRID" | "FREELANCE";
  payment: string;
  startDate: string;
  endDate: string;
  interviewSuites: number;
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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-5 bg-[rgba(18,19,19,0.85)] backdrop-blur-[6px] font-mono"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0 0 60px #64e5af15, 0 24px 48px rgba(0,0,0,0.6)",
          animation: "modalIn 0.2s cubic-bezier(.22,1,.36,1)",
        }}
        className={`w-[520px] rounded-3xl p-7 relative ${Colors.background.secondary} ${Colors.text.primary}`}
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

function ViewField({
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

function CreateField({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  icon: React.ElementType;
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
}) {
  const Colors = useColors();
  return (
    <div className="space-y-2">
      <label
        className={`${Colors.text.special} text-[0.72rem] uppercase tracking-wide`}
      >
        {label}
      </label>
      <div
        className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${Colors.background.primary} ${Colors.border.specialThin}`}
      >
        <Icon size={16} className={`${Colors.text.special} opacity-70`} />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full bg-transparent outline-none text-sm placeholder:text-white/25 ${Colors.text.primary}`}
        />
      </div>
    </div>
  );
}

function TextAreaField({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  const Colors = useColors();
  return (
    <div className="space-y-2">
      <label
        className={`${Colors.text.special} text-[0.72rem] uppercase tracking-wide`}
      >
        {label}
      </label>
      <div
        className={`flex gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${Colors.background.primary} ${Colors.border.specialThin}`}
      >
        <Icon size={16} className={`${Colors.text.special} opacity-70 mt-1`} />
        <textarea
          rows={6}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full bg-transparent outline-none resize-none text-sm placeholder:text-white/25 ${Colors.text.primary}`}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: string;
  options: string[];
  onChange?: (v: string) => void;
}) {
  const Colors = useColors();
  return (
    <div className="space-y-2">
      <label
        className={`${Colors.text.special} text-[0.72rem] uppercase tracking-wide`}
      >
        {label}
      </label>
      <div
        className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${Colors.background.primary} ${Colors.border.specialThin}`}
      >
        <Tag size={16} className={`${Colors.text.special} opacity-70`} />
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full bg-transparent outline-none text-sm ${Colors.text.primary}`}
        >
          <option value="" className="text-black">
            Select Job Type
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="text-black">
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  const Colors = useColors();
  return (
    <div className="space-y-2">
      <label
        className={`${Colors.text.special} text-[0.72rem] uppercase tracking-wide`}
      >
        {label}
      </label>
      <div
        className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${Colors.background.primary} ${Colors.border.specialThin}`}
      >
        <Calendar size={16} className={`${Colors.text.special} opacity-70`} />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full bg-transparent outline-none text-sm ${Colors.text.primary}`}
        />
      </div>
    </div>
  );
}

export default function JobListingTable() {
  const Colors = useColors();
  const router = useRouter();
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [suiteLoadingId, setSuiteLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedJobListing, setSelectedJobListing] =
    useState<JobListing | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editJobId, setEditJobId] = useState<string | null>(null);
  const [addForm, setAddForm] = useState({
    jobRole: "",
    jobType: "",
    payment: "",
    jobDescription: "",
    startDate: "",
    endDate: "",
  });
  const [editForm, setEditForm] = useState({
    jobRole: "",
    jobType: "",
    payment: "",
    jobDescription: "",
    startDate: "",
    endDate: "",
  });

  const normalizeListing = (item: unknown): JobListing => {
    const listing = item as Partial<JobListing> & {
      _count?: { interviewSuites?: number };
    };
    return {
      id: listing.id || "",
      jobRole: listing.jobRole || "",
      jobDescription: listing.jobDescription || "",
      jobType: (listing.jobType as JobListing["jobType"]) || "REMOTE",
      payment: listing.payment || "",
      startDate: listing.startDate || "",
      endDate: listing.endDate || "",
      interviewSuites:
        listing.interviewSuites ?? listing._count?.interviewSuites ?? 0,
    };
  };

  const fetchJobListings = useCallback(async () => {
    try {
      const profileRes = await axiosInstance.get(
        "/api/v1/interviewers/get-profile",
        {
          withCredentials: true,
        },
      );
      const profile = profileRes.data?.data as InterviewerProfile | undefined;
      const profileListings = Array.isArray(profile?.jobListings)
        ? profile.jobListings.map(normalizeListing)
        : [];

      if (profileListings.length > 0) {
        setJobListings(profileListings);
        return;
      }

      // Fallback: pull from dedicated listing endpoint if profile payload is empty/unavailable.
      const listingRes = await axiosInstance.get(
        "/api/v1/jobListing/get-all-job-listing",
        {
          withCredentials: true,
        },
      );
      const listingData = Array.isArray(listingRes.data?.data)
        ? listingRes.data.data.map(normalizeListing)
        : [];
      setJobListings(listingData);
    } catch (error) {
      console.error("Failed to fetch interviewer job listings", error);
      setJobListings([]);
      toast.error("Unable to load job listings");
    } finally {
      setLoading(false);
    }
  }, []);

  async function createJobListing() {
    try {
      setCreating(true);
      await axiosInstance.post(
        "/api/v1/jobListing/create-job-listing",
        addForm,
        {
          withCredentials: true,
        },
      );
      toast.success("Job listing created successfully");
      setShowAddModal(false);
      setAddForm({
        jobRole: "",
        jobType: "",
        payment: "",
        jobDescription: "",
        startDate: "",
        endDate: "",
      });
      await fetchJobListings();
    } catch (error) {
      console.error("Failed to create job listing", error);
      toast.error("Failed to create job listing");
    } finally {
      setCreating(false);
    }
  }

  async function updateJobListing() {
    try {
      if (!editJobId) return;
      setUpdating(true);
      await axiosInstance.put(
        `/api/v1/jobListing/update-job-listing/${editJobId}`,
        editForm,
        {
          withCredentials: true,
        },
      );
      toast.success("Job listing updated.");
      setShowEditModal(false);
      setEditJobId(null);
      await fetchJobListings();
    } catch (error) {
      console.error("Failed to update listing", error);
      toast.error("Failed to update listing");
    } finally {
      setUpdating(false);
    }
  }

  async function deleteJobListing(id: string) {
    try {
      setDeletingId(id);
      await axiosInstance.delete(
        `/api/v1/jobListing/delete-job-listing/${id}`,
        {
          withCredentials: true,
        },
      );
      toast.success("Job listing deleted.");
      await fetchJobListings();
    } catch (error) {
      console.error("Failed to delete listing", error);
      toast.error("Failed to delete listing");
    } finally {
      setDeletingId(null);
    }
  }

  async function createSuiteForJob(job: JobListing) {
    try {
      setSuiteLoadingId(job.id);
      await axiosInstance.post(
        `/api/v1/interview/interview-suite/create/${job.id}`,
        {
          name: `${job.jobRole} Suite`,
          startDate: job.startDate,
          endDate: job.endDate,
          publishStatus: "NOT_PUBLISHED",
        },
        { withCredentials: true },
      );
      toast.success("Interview suite created.");
      await fetchJobListings();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to create suite";
      toast.error(message);
      console.error("Failed to create suite", error);
    } finally {
      setSuiteLoadingId(null);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchJobListings();
  }, [fetchJobListings]);

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

        <button
          onClick={() => setShowAddModal(true)}
          className={`${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} cursor-pointer font-semibold flex items-center gap-2 px-3 text-sm py-2 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]`}
        >
          <Plus size={15} />
          Add Listing
        </button>
      </div>

      <div
        style={{ borderRadius: "18px", overflow: "hidden" }}
        className={`${Colors.background.secondary} ${Colors.border.defaultThin}`}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1.2fr 1.3fr 1.6fr 220px",
            padding: "12px 20px",
          }}
          className={`${Colors.border.defaultThinBottom} ${Colors.background.primary} ${Colors.text.primary} font-mono font-semibold`}
        >
          {["Job Role", "Type", "Payment", "Duration", "Suite", "Actions"].map(
            (h, i) => (
              <span
                key={i}
                className="iv-tag-header font-mono"
                style={{ textAlign: i === 4 ? "right" : "left" }}
              >
                {h}
              </span>
            ),
          )}
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
                gridTemplateColumns: "1.6fr 1fr 1.2fr 1.3fr 1.6fr 220px",
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
              <div className="flex items-center gap-2">
                {jl.interviewSuites.length > 0 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/interviewer-dashboard/interview-suite/${jl.interviewSuites[0].id}`,
                      );
                    }}
                    className={`${Colors.background.special} ${Colors.text.inverted} rounded-md px-2 py-1 text-xs font-semibold`}
                  >
                    Open Suite
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void createSuiteForJob(jl);
                    }}
                    disabled={suiteLoadingId === jl.id}
                    className={`${Colors.border.defaultThin} rounded-md px-2 py-1 text-xs disabled:opacity-50`}
                  >
                    {suiteLoadingId === jl.id ? "Creating..." : "Create Suite"}
                  </button>
                )}
              </div>
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditJobId(jl.id);
                    setEditForm({
                      jobRole: jl.jobRole,
                      jobType: jl.jobType,
                      payment: jl.payment,
                      jobDescription: jl.jobDescription,
                      startDate: jl.startDate?.slice(0, 10) || "",
                      endDate: jl.endDate?.slice(0, 10) || "",
                    });
                    setShowEditModal(true);
                  }}
                  title="Update"
                >
                  <Pencil
                    size={18}
                    className="hover:text-blue-400 transition-colors duration-100"
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void deleteJobListing(jl.id);
                  }}
                  disabled={deletingId === jl.id}
                  title="Delete"
                >
                  <Trash2
                    size={18}
                    className="hover:text-red-500 transition-colors duration-100"
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
            <ViewField
              icon={Briefcase}
              label="Job Role"
              value={selectedJobListing.jobRole}
            />
            <ViewField
              icon={FileText}
              label="Job Description"
              value={selectedJobListing.jobDescription}
            />
            <ViewField
              icon={IndianRupee}
              label="Payment"
              value={`₹${selectedJobListing.payment}`}
            />
            <ViewField
              icon={Tag}
              label="Job Type"
              value={selectedJobListing.jobType}
            />
            <ViewField
              icon={Calendar}
              label="Start Date"
              value={new Date(
                selectedJobListing.startDate,
              ).toLocaleDateString()}
            />
            <ViewField
              icon={Calendar}
              label="End Date"
              value={new Date(selectedJobListing.endDate).toLocaleDateString()}
            />
          </div>
        </Modal>
      ) : null}

      {showAddModal ? (
        <Modal onClose={() => setShowAddModal(false)}>
          <button
            onClick={() => setShowAddModal(false)}
            style={{ position: "absolute", top: 18, right: 18 }}
            className={`cursor-pointer transition-colors ${Colors.text.primary} opacity-40 hover:opacity-100`}
          >
            <X size={16} />
          </button>

          <div className="mb-7">
            <h2 style={{ fontWeight: 700, fontSize: "1.2rem" }}>
              Create Job Listing
            </h2>
            <p className={`${Colors.text.primary} opacity-50 mt-1 text-sm`}>
              Add details for your new hiring opportunity.
            </p>
          </div>

          <div className="space-y-5">
            <CreateField
              icon={Briefcase}
              label="Job Role"
              placeholder="e.g. Frontend Developer"
              value={addForm.jobRole}
              onChange={(v) => setAddForm({ ...addForm, jobRole: v })}
            />

            <SelectField
              label="Job Type"
              value={addForm.jobType}
              options={["REMOTE", "OFFLINE", "HYBRID", "FREELANCE"]}
              onChange={(v) => setAddForm({ ...addForm, jobType: v })}
            />

            <CreateField
              icon={IndianRupee}
              label="Payment"
              placeholder="e.g. 50000"
              type="number"
              value={addForm.payment}
              onChange={(v) => setAddForm({ ...addForm, payment: v })}
            />

            <TextAreaField
              icon={FileText}
              label="Job Description"
              placeholder="Describe responsibilities, required skills, expectations, experience level, and technologies involved..."
              value={addForm.jobDescription}
              onChange={(v) => setAddForm({ ...addForm, jobDescription: v })}
            />

            <div className="grid grid-cols-2 gap-4">
              <DateField
                label="Start Date"
                value={addForm.startDate}
                onChange={(v) => setAddForm({ ...addForm, startDate: v })}
              />
              <DateField
                label="End Date"
                value={addForm.endDate}
                onChange={(v) => setAddForm({ ...addForm, endDate: v })}
              />
            </div>

            <div
              className={`${Colors.background.primary} ${Colors.border.specialThin} rounded-2xl p-4`}
            >
              <p
                className={`${Colors.text.special} opacity-80 text-[0.78rem] leading-relaxed`}
              >
                A detailed job description and accurate timeline help attract
                better applicants and improve engagement.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className={`${Colors.text.primary} ${Colors.border.defaultThin} ${Colors.properties.interactiveButton} px-4 py-2 rounded-xl font-semibold`}
              >
                Cancel
              </button>

              <button
                disabled={
                  creating ||
                  !addForm.jobRole ||
                  !addForm.jobType ||
                  !addForm.payment ||
                  !addForm.jobDescription
                }
                onClick={createJobListing}
                className={`${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} px-4 py-2 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {creating ? "Creating..." : "Create Listing"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {showEditModal ? (
        <Modal onClose={() => setShowEditModal(false)}>
          <button
            onClick={() => setShowEditModal(false)}
            style={{ position: "absolute", top: 18, right: 18 }}
            className={`cursor-pointer transition-colors ${Colors.text.primary} opacity-40 hover:opacity-100`}
          >
            <X size={16} />
          </button>

          <div className="mb-7">
            <h2 style={{ fontWeight: 700, fontSize: "1.2rem" }}>
              Update Job Listing
            </h2>
          </div>

          <div className="space-y-5">
            <CreateField
              icon={Briefcase}
              label="Job Role"
              placeholder="Role"
              value={editForm.jobRole}
              onChange={(v) => setEditForm({ ...editForm, jobRole: v })}
            />
            <SelectField
              label="Job Type"
              value={editForm.jobType}
              options={["REMOTE", "OFFLINE", "HYBRID", "FREELANCE"]}
              onChange={(v) => setEditForm({ ...editForm, jobType: v })}
            />
            <CreateField
              icon={IndianRupee}
              label="Payment"
              placeholder="Payment"
              type="number"
              value={editForm.payment}
              onChange={(v) => setEditForm({ ...editForm, payment: v })}
            />
            <TextAreaField
              icon={FileText}
              label="Job Description"
              placeholder="Description"
              value={editForm.jobDescription}
              onChange={(v) => setEditForm({ ...editForm, jobDescription: v })}
            />
            <div className="grid grid-cols-2 gap-4">
              <DateField
                label="Start Date"
                value={editForm.startDate}
                onChange={(v) => setEditForm({ ...editForm, startDate: v })}
              />
              <DateField
                label="End Date"
                value={editForm.endDate}
                onChange={(v) => setEditForm({ ...editForm, endDate: v })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowEditModal(false)}
                className={`${Colors.text.primary} ${Colors.border.defaultThin} ${Colors.properties.interactiveButton} px-4 py-2 rounded-xl font-semibold`}
              >
                Cancel
              </button>
              <button
                disabled={updating || !editForm.jobRole || !editForm.jobType}
                onClick={updateJobListing}
                className={`${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} px-4 py-2 rounded-xl font-semibold disabled:opacity-40`}
              >
                {updating ? "Updating..." : "Update Listing"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
