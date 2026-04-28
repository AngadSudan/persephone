"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Spinner from "@/components/General/Spinner";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import {
    Trash2,
    Eye,
    Plus,
    Search,
    X,
    User,
    Briefcase,
    FileText,
    IndianRupee,
    Tag,
    Calendar,
    ChevronRight,
    ChevronLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
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


/* ── reusable pill badge ── */
function Pill({ children }: { children: React.ReactNode }) {
    const Colors = useColors();
    return (
        <span className={`text-sm px-2 py-0.5 rounded-full ${Colors.background.special} ${Colors.text.inverted} font-mono font-semibold`}>
            {children}
        </span>
    );
}
async function handleCreateJobListing(data: { jobRole: string; jobType: string; payment: string; jobDescription: string; startDate: string; endDate: string }) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
        await axiosInstance.post(`${backendUrl}/api/v1/job-listings/create-job-listing`, data, { withCredentials: true });
        toast.success("Job Listing created successfully");
    } catch (err) {
        console.error("Failed to create job listing", err);
        toast.error("Failed to create job listing");
    }
}
/* ── modal wrapper ── */
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

/* ── styled input ── */
function Field({
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
        <div className="space-y-1.5 font-mono">
            <label style={{ fontSize: "0.72rem", fontFamily: "'DM Mono', monospace" }} className={`block ${Colors.text.special}`}>
                {label}
            </label>
            <div
                className={`flex items-center gap-3 rounded-xl px-4 py-3 focus-within:outline-1 ${Colors.background.primary} ${Colors.text.primary} transition-colors duration-200 ${Colors.border.specialThin}`}
            >
                <Icon size={15} className={`shrink-0 opacity-70 ${Colors.text.special}`} />
                <input
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    style={{
                        fontSize: "0.875rem",
                        outline: "none",
                        width: "100%",
                        fontFamily: "inherit",
                    }}
                    className={`placeholder:text-white/75 ${Colors.text.primary}`}
                />
            </div>
        </div>
    );
}

export default function JobListingsTable() {
    const Colors = useColors();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const router = useRouter();

    const [jobListings, setJobListings] = useState<JobListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedJobListing, setSelectedJobListing] = useState<JobListing | null>(null);
    const [editData, setEditData] = useState<JobListing | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ jobRole: "", jobType: "", payment: "", jobDescription: "", startDate: "", endDate: "" });
    const [deletingId, setDeletingId] = useState<string | null>(null);

    async function fetchJobListings() {
        try {
            const res = await axiosInstance.get(
                `${backendUrl}/api/v1/job-listings/get-all-job-listing`,
                { withCredentials: true }
            );
            const data = res.data;
            console.log("Fetched job listings:", data);
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
            await axiosInstance.delete(`${backendUrl}/api/v1/job-listings/delete-job-listing/${id}`, {
                withCredentials: true,
            });
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
                { withCredentials: true }
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
        `${j.jobRole} ${j.jobType} ${j.payment}`.toLowerCase().includes(search.toLowerCase())
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
                <p style={{ fontSize: "0.75rem" }} className={`${Colors.text.special} opacity-80`}>
                    loading listings...
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="space-y-5 mono font-mono">
            <div className="flex items-center justify-between gap-2 mono font-mono">
                <button
                    className={`${Colors.background.primary} ${Colors.text.primary} ${Colors.properties.interactiveButton} cursor-pointer p-2 rounded-md transition-colors`}
                    onClick={() => {
                        router.push("/org-dashboard");
                    }}
                >
                    <ChevronLeft />
                </button>

                <div className={`${Colors.background.primary} ${Colors.text.primary} rounded-md flex items-center gap-2.5 px-3.5 py-2.25 w-[80%] transition-colors duration-200`}>
                    <Search className={`${Colors.text.special}`} size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
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
                        <button onClick={() => setSearch("")} className="cursor-pointer opacity-40 hover:opacity-70">
                            <X size={22} className="hover:text-red-700 transition-colors duration-100 active:scale-90 cursor-pointer" />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className={` ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} cursor-pointer font-semibold flex items-center gap-2 px-2 text-sm py-2 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]`}
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
                    <div style={{ padding: "48px 24px", textAlign: "center" }} className={`${Colors.text.primary} opacity-40`}>
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
                                <ChevronRight size={13} className="iv-chevron" color="#64e5af" />
                            </div>

                            <div>
                                <Pill>{jl.jobType}</Pill>
                            </div>

                            <span style={{ fontSize: "0.84rem" }} className={`${Colors.text.primary} opacity-70`}>₹{jl.payment}</span>

                            <span style={{ fontSize: "0.84rem" }} className={`${Colors.text.primary} opacity-70`}>
                                {new Date(jl.startDate).toLocaleDateString()} - {new Date(jl.endDate).toLocaleDateString()}
                            </span>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedJobListing(jl);
                                        setEditData({ ...jl });
                                    }}
                                    className="iv-btn iv-btn-ghost cursor-pointer"
                                    title="View"
                                >
                                    <Eye size={22} className="hover:text-gray-400 transition-colors duration-100 active:scale-90 cursor-pointer" />
                                </button>

                                <button
                                    onClick={() => deleteJobListing(jl.id)}
                                    disabled={deletingId === jl.id}
                                    className="iv-btn iv-btn-danger cursor-pointer"
                                    title="Delete"
                                >
                                    {deletingId === jl.id ? (
                                        <span style={{ fontSize: "0.7rem" }}>…</span>
                                    ) : (
                                        <Trash2 size={22} className="hover:text-red-700 transition-colors duration-100 active:scale-90 cursor-pointer" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedJobListing && editData && (
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
                            {selectedJobListing.jobRole.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: "1rem" }}>{selectedJobListing.jobRole}</p>
                            <p style={{ fontSize: "0.75rem" }} className={`${Colors.text.special} opacity-80`}>{selectedJobListing.jobType}</p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6 font-mono">
                        <Field
                            icon={Briefcase}
                            label="Job Role"
                            placeholder="e.g. Frontend Developer"
                            value={editData.jobRole}
                            onChange={(v) =>
                                setEditData((current) =>
                                    current ? { ...current, jobRole: v } : current
                                )
                            }
                        />
                        <Field
                            icon={FileText}
                            label="Job Description"
                            placeholder="Describe responsibilities and requirements"
                            value={editData.jobDescription}
                            onChange={(v) =>
                                setEditData((current) =>
                                    current ? { ...current, jobDescription: v } : current
                                )
                            }
                        />
                        <Field
                            icon={IndianRupee}
                            label="Payment"
                            placeholder="e.g. 50000"
                            value={editData.payment}
                            onChange={(v) =>
                                setEditData((current) =>
                                    current ? { ...current, payment: v } : current
                                )
                            }
                        />
                        <Field
                            icon={Tag}
                            label="Job Type"
                            placeholder="REMOTE / OFFLINE / HYBRID / FREELANCE"
                            value={editData.jobType}
                            onChange={(v) =>
                                setEditData((current) =>
                                    current ? { ...current, jobType: v as JobListing["jobType"] } : current
                                )
                            }
                        />
                        <Field
                            icon={Calendar}
                            label="Start Date"
                            placeholder="YYYY-MM-DD"
                            value={editData.startDate}
                            onChange={(v) =>
                                setEditData((current) =>
                                    current ? { ...current, startDate: v } : current
                                )
                            }
                        />
                        <Field
                            icon={Calendar}
                            label="End Date"
                            placeholder="YYYY-MM-DD"
                            value={editData.endDate}
                            onChange={(v) =>
                                setEditData((current) =>
                                    current ? { ...current, endDate: v } : current
                                )
                            }
                        />
                    </div>

                    <div className="flex justify-end gap-3 font-mono">
                        <button
                            onClick={() => setSelectedJobListing(null)}
                            className={` ${Colors.text.primary} ${Colors.properties.interactiveButton} ${Colors.border.defaultThin} font-semibold flex items-center gap-2 px-2 py-2 rounded-lg font-mono`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (editData) {
                                    editJobListing(editData);
                                }
                            }}
                            className={` ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} font-semibold flex items-center gap-2 px-2 py-2 rounded-lg font-mono`}
                        >
                            Save Changes
                        </button>
                    </div>
                </Modal>
            )}

            {showAddModal && (
                <Modal onClose={() => setShowAddModal(false)}>
                    <button
                        onClick={() => setShowAddModal(false)}
                        style={{ position: "absolute", top: 18, right: 18 }}
                        className={`cursor-pointer transition-colors ${Colors.text.primary} opacity-40 hover:opacity-100`}
                    >
                        <X size={16} />
                    </button>

                    <div className="mb-6 font-mono">
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                borderRadius: "10px",
                                padding: "6px 12px",
                                fontSize: "0.72rem",
                                marginBottom: "10px",
                            }}
                            className={`${Colors.background.special} ${Colors.border.defaultThin} ${Colors.text.inverted}`}
                        >
                            <Plus size={11} /> new job listing
                        </div>
                        <h2 style={{ fontWeight: 700, fontSize: "1.15rem" }}>Add Job Listing</h2>
                        <p style={{ fontSize: "0.82rem", marginTop: 3 }} className={`${Colors.text.primary} opacity-50`}>
                            Create a new job opening for your organization.
                        </p>
                    </div>

                    <div className="space-y-3 mb-6 font-mono">
                        <Field
                            icon={Briefcase}
                            label="Job Role"
                            placeholder="e.g. Frontend Developer"
                            value={addForm.jobRole}
                            onChange={(v) => setAddForm({ ...addForm, jobRole: v })}
                        />
                        <Field
                            icon={Tag}
                            label="Job Type"
                            placeholder="REMOTE / OFFLINE / HYBRID / FREELANCE"
                            value={addForm.jobType}
                            onChange={(v) => setAddForm({ ...addForm, jobType: v })}
                        />
                        <Field
                            icon={IndianRupee}
                            label="Payment"
                            placeholder="e.g. 50000"
                            value={addForm.payment}
                            onChange={(v) => setAddForm({ ...addForm, payment: v })}
                        />
                        <Field
                            icon={FileText}
                            label="Job Description"
                            placeholder="Describe responsibilities and requirements"
                            value={addForm.jobDescription}
                            onChange={(v) => setAddForm({ ...addForm, jobDescription: v })}
                        />
                        <Field
                            icon={Calendar}
                            label="Start Date"
                            placeholder="YYYY-MM-DD"
                            value={addForm.startDate}
                            onChange={(v) => setAddForm({ ...addForm, startDate: v })}
                        />
                        <Field
                            icon={Calendar}
                            label="End Date"
                            placeholder="YYYY-MM-DD"
                            value={addForm.endDate}
                            onChange={(v) => setAddForm({ ...addForm, endDate: v })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 font-mono">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className={` ${Colors.text.primary} ${Colors.properties.interactiveButton} ${Colors.border.defaultThin} font-semibold flex items-center gap-2 px-2 py-2 rounded-lg font-mono`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                handleCreateJobListing(addForm);
                                setShowAddModal(false);
                                setAddForm({ jobRole: "", jobType: "", payment: "", jobDescription: "", startDate: "", endDate: "" });
                            }}
                            className={` ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} font-semibold flex items-center gap-2 px-2 py-2 rounded-lg font-mono`}
                        >
                            Create Listing
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}