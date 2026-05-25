"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { useColors } from "@/components/General/(Color Manager)/useColors";

import {
  Trash2,
  Eye,
  Plus,
  Search,
  X,
  Briefcase,
  FileText,
  IndianRupee,
  Tag,
  Calendar,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import axiosInstance from "@/utils/axiosInstance";

type JobListing = {
  id: string;
  jobRole: string;
  jobDescription: string;
  jobType: "REMOTE" | "OFFLINE" | "HYBRID" | "FREELANCE";
  payment: string;
  startDate: string;
  endDate: string;
  organizationId: string;
};

/* ───────────────────────────────────────────── */
/* reusable badge */
/* ───────────────────────────────────────────── */

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

/* ───────────────────────────────────────────── */
/* api */
/* ───────────────────────────────────────────── */

async function handleCreateJobListing(data: {
  jobRole: string;
  jobType: string;
  payment: string;
  jobDescription: string;
  startDate: string;
  endDate: string;
}) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  try {
    await axiosInstance.post(
      `${backendUrl}/api/v1/job-listings/create-job-listing`,
      data,
      { withCredentials: true },
    );

    toast.success("Job Listing created successfully");
  } catch (err) {
    console.error("Failed to create job listing", err);
    toast.error("Failed to create job listing");
  }
}

/* ───────────────────────────────────────────── */
/* modal */
/* ───────────────────────────────────────────── */

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

        <style>{`
          @keyframes modalIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(8px);
            }

            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────── */
/* input field */
/* ───────────────────────────────────────────── */

function Field({
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

/* ───────────────────────────────────────────── */
/* textarea field */
/* ───────────────────────────────────────────── */

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

/* ───────────────────────────────────────────── */
/* select field */
/* ───────────────────────────────────────────── */

function SelectField({
  icon: Icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: React.ElementType;
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

/* ───────────────────────────────────────────── */
/* date field */
/* ───────────────────────────────────────────── */

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

/* ───────────────────────────────────────────── */
/* main component */
/* ───────────────────────────────────────────── */

export default function JobListingsTable() {
  const Colors = useColors();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const router = useRouter();

  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedJobListing, setSelectedJobListing] =
    useState<JobListing | null>(null);

  const [editData, setEditData] = useState<JobListing | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const [creating, setCreating] = useState(false);

  const [addForm, setAddForm] = useState({
    jobRole: "",
    jobType: "",
    payment: "",
    jobDescription: "",
    startDate: "",
    endDate: "",
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchJobListings() {
    try {
      const res = await axiosInstance.get(
        `${backendUrl}/api/v1/job-listings/get-all-job-listing`,
        { withCredentials: true },
      );

      const data = res.data;

      setJobListings(data.data);
    } catch (err) {
      console.error("Failed to fetch job listings", err);
      setJobListings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobListings();
  }, []);

  async function deleteJobListing(id: string) {
    setDeletingId(id);

    try {
      await axiosInstance.delete(
        `${backendUrl}/api/v1/job-listings/delete-job-listing/${id}`,
        {
          withCredentials: true,
        },
      );

      setJobListings((prev) => prev.filter((j) => j.id !== id));

      toast.success("Job Listing deleted");
    } catch (err) {
      toast.error("Failed to delete job listing");
      console.error("Delete failed", err);
    } finally {
      setDeletingId(null);
    }
  }

  async function editJobListing(data: JobListing) {
    try {
      await axiosInstance.put(
        `${backendUrl}/api/v1/job-listings/update-job-listing/${data.id}`,
        data,
        { withCredentials: true },
      );

      toast.success("Job Listing updated successfully");

      fetchJobListings();

      setSelectedJobListing(null);
    } catch (err) {
      console.error("Edit failed", err);
      toast.error("Failed to update job listing");
    }
  }

  const filtered = jobListings.filter((j) =>
    `${j.jobRole} ${j.jobType} ${j.payment}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div
        style={{ minHeight: "300px" }}
        className={`flex flex-col items-center justify-center gap-4 rounded-2xl font-mono ${Colors.background.primary}`}
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
          loading listings...
        </p>

        <style>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-5 mono font-mono">
      {/* top bar */}

      <div className="flex items-center justify-between gap-2 mono font-mono">
        <button
          className={`${Colors.background.primary} ${Colors.text.primary} ${Colors.properties.interactiveButton} cursor-pointer p-2 rounded-md transition-colors`}
          onClick={() => {
            router.push("/org-dashboard");
          }}
        >
          <ChevronLeft />
        </button>

        <div
          className={`${Colors.background.primary} ${Colors.text.primary} rounded-md flex items-center gap-2.5 px-3.5 py-2.25 w-[80%] transition-colors duration-200`}
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
          className={` ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} cursor-pointer font-semibold flex items-center gap-2 px-3 text-sm py-2 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]`}
        >
          <Plus size={15} />
          Add Listing
        </button>
      </div>

      {/* table */}

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
              onClick={() => {
                setSelectedJobListing(jl);
                setEditData({ ...jl });
              }}
              className={`iv-row cursor-pointer transition-colors font-mono ${Colors.text.primary} ${Colors.hover.special} ${
                idx < filtered.length - 1 ? Colors.border.specialThinBottom : ""
              }`}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1.5fr 1.5fr 100px",
                padding: "14px 20px",
                alignItems: "center",
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
                <button className="cursor-pointer">
                  <Eye
                    size={22}
                    className="hover:text-gray-400 transition-colors duration-100 active:scale-90 cursor-pointer"
                  />
                </button>

                <button
                  onClick={() => deleteJobListing(jl.id)}
                  disabled={deletingId === jl.id}
                  className="cursor-pointer"
                >
                  {deletingId === jl.id ? (
                    <span style={{ fontSize: "0.7rem" }}>…</span>
                  ) : (
                    <Trash2
                      size={22}
                      className="hover:text-red-700 transition-colors duration-100 active:scale-90 cursor-pointer"
                    />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* create modal */}

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <button
            onClick={() => setShowAddModal(false)}
            style={{
              position: "absolute",
              top: 18,
              right: 18,
            }}
            className={`cursor-pointer transition-colors ${Colors.text.primary} opacity-40 hover:opacity-100`}
          >
            <X size={16} />
          </button>

          <div className="mb-7">
            <h2
              style={{
                fontWeight: 700,
                fontSize: "1.2rem",
              }}
            >
              Create Job Listing
            </h2>

            <p className={`${Colors.text.primary} opacity-50 mt-1 text-sm`}>
              Add details for your new hiring opportunity.
            </p>
          </div>

          <div className="space-y-5">
            <Field
              icon={Briefcase}
              label="Job Role"
              placeholder="e.g. Frontend Developer"
              value={addForm.jobRole}
              onChange={(v) =>
                setAddForm({
                  ...addForm,
                  jobRole: v,
                })
              }
            />

            <SelectField
              icon={Tag}
              label="Job Type"
              value={addForm.jobType}
              options={["REMOTE", "OFFLINE", "HYBRID", "FREELANCE"]}
              onChange={(v) =>
                setAddForm({
                  ...addForm,
                  jobType: v,
                })
              }
            />

            <Field
              icon={IndianRupee}
              label="Payment"
              placeholder="e.g. 50000"
              type="number"
              value={addForm.payment}
              onChange={(v) =>
                setAddForm({
                  ...addForm,
                  payment: v,
                })
              }
            />

            <TextAreaField
              icon={FileText}
              label="Job Description"
              placeholder="Describe responsibilities, required skills, expectations, experience level, and technologies involved..."
              value={addForm.jobDescription}
              onChange={(v) =>
                setAddForm({
                  ...addForm,
                  jobDescription: v,
                })
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <DateField
                label="Start Date"
                value={addForm.startDate}
                onChange={(v) =>
                  setAddForm({
                    ...addForm,
                    startDate: v,
                  })
                }
              />

              <DateField
                label="End Date"
                value={addForm.endDate}
                onChange={(v) =>
                  setAddForm({
                    ...addForm,
                    endDate: v,
                  })
                }
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
                  !addForm.payment
                }
                onClick={async () => {
                  try {
                    setCreating(true);

                    await handleCreateJobListing(addForm);

                    setShowAddModal(false);

                    setAddForm({
                      jobRole: "",
                      jobType: "",
                      payment: "",
                      jobDescription: "",
                      startDate: "",
                      endDate: "",
                    });

                    fetchJobListings();
                  } finally {
                    setCreating(false);
                  }
                }}
                className={`${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} px-4 py-2 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {creating ? "Creating..." : "Create Listing"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
