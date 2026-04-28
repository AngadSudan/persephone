"use client";

import { useEffect, useState } from "react";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import { Trash2, Eye, Plus, Search, X, User, Mail, ChevronRight, ChevronLeft, IdCard } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";

type Interviewer = {
    id: string;
    name: string;
    username: string;
    email: string;
    // Orgnization id to be added
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
async function handleCreateInterviewer(data: { name: string; username: string; email: string }) {
    return axiosInstance.post(`/api/v1/organizations/create-interviewer`, data, { withCredentials: true });
}

function InlineSpinner() {
    return <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

function emitInterviewersChanged() {
    window.dispatchEvent(new Event("organization-interviewers-changed"));
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,19,19,0.85)] backdrop-blur-[6px]"
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

export default function InterviewersTable() {
    const Colors = useColors();
    const router = useRouter();

    const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedInterviewer, setSelectedInterviewer] = useState<Interviewer | null>(null);
    const [editData, setEditData] = useState<Interviewer | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ name: "", username: "", email: "" });
    const [creating, setCreating] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    
    async function fetchInterviewers() {
        try {
            const res = await axiosInstance.get(`/api/v1/organizations/interviewers`, { withCredentials: true });
            const data = res.data
            console.log("Fetched interviewers:", data);
            setInterviewers(Array.isArray(data?.data) ? data.data : []);
        } catch (err) {
            console.error("Failed to fetch interviewers", err);
            setInterviewers([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchInterviewers(); }, []);

    async function deleteInterviewer(id: string) {
        setDeletingId(id);
        try {
            await axiosInstance.delete(`/api/v1/organizations/interviewers/${id}`, {
                withCredentials: true,
            });
            toast.success("Interviewer deleted");
            await fetchInterviewers();
            emitInterviewersChanged();
        } catch (err) {
            toast.error("Failed to delete interviewer");
            console.error("Delete failed", err);
        } finally {
            setDeletingId(null);
        }
    }

    async function editInterviewer(data: Interviewer) {
        setSavingId(data.id);
        try {
            await axiosInstance.put(
                `/api/v1/organizations/interviewers/${data.id}`,
                data,
                { withCredentials: true }
            );
            toast.success("Interviewer updated");
            await fetchInterviewers();
            emitInterviewersChanged();
            setSelectedInterviewer(null);
            setEditData(null);
        } catch (err) {
            console.error("Edit failed", err);
            toast.error("Failed to update interviewer");
        } finally {
            setSavingId(null);
        }
    }

    const filtered = interviewers.filter((i) =>
        `${i.name} ${i.username} ${i.email}`.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div
                style={{ minHeight: "300px" }}
                className={`flex flex-col items-center justify-center gap-4 rounded-2xl ${Colors.background.primary}`}
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
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem" }} className={`${Colors.text.special} opacity-80`}>
                    loading interviewers...
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <>


            <div
                className="space-y-5 mono"
            >

                <div className="flex items-center justify-between gap-2 mono">
                    <button className={`${Colors.background.primary} ${Colors.text.primary} ${Colors.properties.interactiveButton} p-2 rounded-md`} onClick={() => {
                      router.push("/org-dashboard")
                    }
                    }><ChevronLeft /></button>

                    <div className={`${Colors.background.primary} ${Colors.text.primary} rounded-md flex items-center gap-2.5 px-3.5 py-2.25 w-[80%] transition-colors duration-200`}>
                        <Search className={`${Colors.text.special}`} size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
                        <input
                            placeholder="Search interviewers…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                background: "transparent",
                                fontSize: "0.84rem",
                                outline: "none",
                                width: "100%",
                                fontFamily: "'Syne', sans-serif",
                            }}
                            className={`placeholder:text-white/25 ${Colors.text.primary}`}
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="opacity-40 hover:opacity-70">
                                <X size={22} className="hover:text-red-700 transition-colors duration-100 active:scale-90 cursor-pointer" />
                            </button>
                        )}
                    </div>



                    <button
                        onClick={() => setShowAddModal(true)}
                        className={` ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} font-semibold flex items-center gap-2 px-1 text-sm py-2 rounded-lg font-mono`}
                    >
                        <Plus size={15} />
                        Add Interviewer
                    </button>
                </div>

                {/* ── TABLE ── */}
                <div
                    style={{ borderRadius: "18px", overflow: "hidden" }}
                    className={`${Colors.background.secondary} ${Colors.border.defaultThin}`}
                >
                    {/* table header */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1.5fr 2fr 100px",
                            padding: "12px 20px",
                        }}
                        className={`${Colors.border.defaultThinBottom} ${Colors.background.primary} ${Colors.text.primary} font-mono font-semibold`}
                    >
                        {["Interviewer", "Username", "Email", ""].map((h, i) => (
                            <span
                                key={i}
                                className="iv-tag-header"
                                style={{ textAlign: i === 3 ? "right" : "left" }}
                            >
                                {h}
                            </span>
                        ))}
                    </div>

                    {/* rows */}
                    {filtered.length === 0 ? (
                        <div
                            style={{ padding: "48px 24px", textAlign: "center" }}
                            className={`${Colors.text.primary} opacity-40`}
                        >
                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem" }}>
                                no interviewers found
                            </p>
                        </div>
                    ) : (
                        filtered.map((it, idx) => (
                            <div
                                key={it.id}
                                onClick={() => {
                                    setSelectedInterviewer(it);
                                    setEditData({ ...it });
                                }}
                                className={`iv-row cursor-pointer transition-colors ${Colors.text.primary} font-mono ${Colors.hover.special} ${idx < filtered.length - 1 ? Colors.border.specialThinBottom : ""}`}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "2fr 1.5fr 2fr 100px",
                                    padding: "14px 20px",
                                    alignItems: "center",
                                    animationDelay: `${idx * 40}ms`,
                                }}
                            >
                                {/* name + avatar */}
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold font-mono">{it.name}</span>
                                    <ChevronRight size={13} className="iv-chevron" color="#64e5af" />
                                </div>

                                {/* username */}
                                <div>
                                    <Pill>@{it.username}</Pill>
                                </div>

                                {/* email */}
                                <span style={{ fontSize: "0.84rem", fontFamily: "'DM Mono', monospace" }} className={`${Colors.text.primary} opacity-70`}>
                                    {it.email}
                                </span>

                                {/* actions */}
                                <div className="flex items-center justify-end gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedInterviewer(it); setEditData({ ...it }); }}
                                        className="iv-btn iv-btn-ghost"
                                        title="View"
                                    >
                                        <Eye size={22} className="hover:text-gray-400 transition-colors duration-100 active:scale-90 cursor-pointer" />
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteInterviewer(it.id); }}
                                        disabled={deletingId === it.id}
                                        className="iv-btn iv-btn-danger"
                                        title="Delete"
                                    >
                                        {deletingId === it.id ? (
                                            <InlineSpinner />
                                        ) : (
                                            <Trash2 size={22} className="hover:text-red-700 transition-colors duration-100 active:scale-90 cursor-pointer" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ── VIEW / EDIT MODAL ── */}
                {selectedInterviewer && editData && (
                    <Modal onClose={() => setSelectedInterviewer(null)}>
                        {/* close btn */}
                        <button
                            onClick={() => setSelectedInterviewer(null)}
                            style={{ position: "absolute", top: 18, right: 18 }}
                            className={`transition-colors ${Colors.text.primary} opacity-40 hover:opacity-100`}
                        >
                            <X size={22} className="hover:text-red-700 transition-colors duration-100 active:scale-90 cursor-pointer" />
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div
                                style={{
                                    width: 52, height: 52,
                                    background: "linear-gradient(135deg,#64e5af22,#64e5af44)",
                                    border: "1px solid #64e5af55",
                                    borderRadius: "14px",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "1rem", fontWeight: 700,
                                }}
                                className={`font-mono ${Colors.text.special}`}
                            >
                                {selectedInterviewer.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: "1rem" }} className={`font-mono ${Colors.text.primary}`}>
                                    {selectedInterviewer.name}
                                </p>
                                <p style={{ fontSize: "0.75rem"}} className={`${Colors.text.special} opacity-80 font-mono`}>
                                    @{selectedInterviewer.username}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <Field
                                icon={User}
                                label="Full Name"
                                placeholder="e.g. Alex Johnson"
                                value={editData.name}
                                onChange={(v) => setEditData({ ...editData, name: v })}
                            />
                            <Field
                                icon={IdCard}
                                label="Username"
                                placeholder="e.g. alex_j"
                                value={editData.username}
                                onChange={(v) => setEditData({ ...editData, username: v })}
                            />
                            <Field
                                icon={Mail}
                                label="Email Address"
                                placeholder="e.g. alex@company.com"
                                value={editData.email}
                                onChange={(v) => setEditData({ ...editData, email: v })}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedInterviewer(null)}
                                className={` ${Colors.text.primary} ${Colors.properties.interactiveButton} ${Colors.border.defaultThin} font-semibold flex items-center gap-2 px-2 py-2 rounded-lg font-mono`}
                            >
                                Cancel
                            </button>
                            <button
                                disabled={savingId === editData.id}
                                onClick={() => editInterviewer(editData)}
                                className={` ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} font-semibold flex items-center gap-2 px-2 py-2 rounded-lg font-mono disabled:opacity-70`}
                            >
                                {savingId === editData.id ? <InlineSpinner /> : null}
                                {savingId === editData.id ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </Modal>
                )}

                {/* ── ADD MODAL ── */}
                {showAddModal && (
                    <Modal onClose={() => setShowAddModal(false)}>
                        <button
                            onClick={() => setShowAddModal(false)}
                            style={{ position: "absolute", top: 18, right: 18 }}
                            className={`transition-colors ${Colors.text.primary} opacity-40 hover:opacity-100`}
                        >
                            <X size={22} className="hover:text-red-700 transition-colors duration-100 active:scale-90 cursor-pointer" />
                        </button>

                        <div className="mb-6 font-mono">
                            <div
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: 8,
                                    borderRadius: "10px", padding: "6px 12px",
                                    fontSize: "0.72rem",
                                    marginBottom: "10px",
                                }}
                                className={`${Colors.background.special} ${Colors.border.defaultThin} ${Colors.text.inverted}`}
                            >
                                <Plus size={11} /> New Interviewer
                            </div>
                            <h2 style={{ fontWeight: 700, fontSize: "1.15rem" }}>Add Interviewer</h2>
                            <p style={{ fontSize: "0.82rem", marginTop: 3 }} className={`${Colors.text.primary} opacity-50`}>
                                They'll receive an invite to join your workspace.
                            </p>
                        </div>

                        <div className="space-y-3 mb-6">
                            <Field
                                icon={User}
                                label="Full Name"
                                placeholder="e.g. Alex Johnson"
                                value={addForm.name}
                                onChange={(v) => setAddForm({ ...addForm, name: v })}
                            />
                            <Field
                                icon={Mail}
                                label="Email Address"
                                placeholder="e.g. alex@company.com"
                                value={addForm.email}
                                onChange={(v) => setAddForm({ ...addForm, email: v })}
                            />
                            <Field
                                icon={IdCard}
                                label="Username"
                                placeholder="e.g. alex_j"
                                value={addForm.username}
                                onChange={(v) => setAddForm({ ...addForm, username: v })}
                            />

                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className={`iv-btn iv-btn-ghost ${Colors.properties.interactiveButton} ${Colors.text.primary} font-semibold font-mono`}
                                style={{ padding: "8px 16px", borderRadius: "10px" }}
                            >
                                Cancel
                            </button>
                            <button
                                disabled={creating}
                                onClick={async () => {
                                    setCreating(true);
                                    try {
                                        await handleCreateInterviewer(addForm);
                                        toast.success("Interviewer created successfully");
                                        setShowAddModal(false);
                                        setAddForm({ name: "", username: "", email: "" });
                                        await fetchInterviewers();
                                        emitInterviewersChanged();
                                    } catch (err) {
                                        console.error("Failed to create interviewer", err);
                                        toast.error("Failed to create interviewer");
                                    } finally {
                                        setCreating(false);
                                    }
                                }}
                                className={`iv-btn-primary ${Colors.background.special} ${Colors.text.inverted} px-4 py-2 rounded-lg ${Colors.properties.interactiveButton} font-semibold font-mono disabled:opacity-70`}
                            >
                                {creating ? <InlineSpinner /> : null}
                                {creating ? "Sending..." : "Send Invite"}
                            </button>
                        </div>
                    </Modal>
                )}

            </div>
        </>
    );
}