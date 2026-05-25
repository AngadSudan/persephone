"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import {
  Calendar,
  ChevronRight,
  Eye,
  Search,
  ListChecks,
  FileText,
  User,
  X,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

type Wishlist = {
  id: string;
  name: string;
  description?: string;
  creatorId?: string;
  createdAt?: string;
};

type InterviewerProfile = {
  wishlists: Wishlist[];
};

type WishlistForm = {
  name: string;
  description: string;
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

export default function WishlistTable() {
  const router = useRouter();
  const Colors = useColors();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(
    null,
  );
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formData, setFormData] = useState<WishlistForm>({
    name: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [wishlistToDelete, setWishlistToDelete] = useState<Wishlist | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);

  const fetchWishlists = async () => {
    try {
      const res = await axiosInstance.get("/api/v1/interviewers/get-profile", {
        withCredentials: true,
      });

      const result = res.data as {
        statusCode?: number;
        message?: string;
        data?: InterviewerProfile | null;
      };

      if (!result?.data) {
        throw new Error(result?.message || "Failed to fetch wishlists");
      }

      const items = Array.isArray(result.data.wishlists)
        ? result.data.wishlists
        : [];

      setWishlists(items);
    } catch (error) {
      console.error("Failed to fetch interviewer wishlists", error);
      setWishlists([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchWishlists();
  }, []);

  const filtered = useMemo(
    () =>
      wishlists.filter((wishlist) =>
        `${wishlist.name} ${wishlist.description ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [wishlists, search],
  );

  const openCreateModal = () => {
    setFormMode("create");
    setFormData({ name: "", description: "" });
    setSelectedWishlist(null);
  };

  const openEditModal = (wishlist: Wishlist) => {
    setFormMode("edit");
    setSelectedWishlist(wishlist);
    setFormData({
      name: wishlist.name,
      description: wishlist.description ?? "",
    });
  };

  const closeFormModal = () => {
    setFormMode(null);
    setFormData({ name: "", description: "" });
  };

  const refreshWishlists = async () => {
    setRefreshing(true);
    await fetchWishlists();
  };

  const handleSaveWishlist = async () => {
    if (!formData.name.trim()) {
      toast.error("Wishlist name is required");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(
      formMode === "create" ? "Creating wishlist..." : "Updating wishlist...",
    );

    try {
      if (formMode === "create") {
        const res = await axiosInstance.post(
          "/api/v1/interviewer/wishlist/create-wishlist",
          {
            name: formData.name.trim(),
            description: formData.description.trim(),
          },
          { withCredentials: true },
        );

        const result = res.data as {
          statusCode?: number;
          message?: string;
          data?: Wishlist | null;
        };

        if (!result?.data) {
          throw new Error(result?.message || "Could not create wishlist");
        }

        toast.success("Wishlist created successfully", { id: toastId });
      } else if (formMode === "edit" && selectedWishlist) {
        const res = await axiosInstance.put(
          `/api/v1/interviewer/wishlist/update-wishlist/${selectedWishlist.id}`,
          {
            name: formData.name.trim(),
            description: formData.description.trim(),
          },
          { withCredentials: true },
        );

        const result = res.data as {
          statusCode?: number;
          message?: string;
          data?: Wishlist | null;
        };

        if (!result?.data) {
          throw new Error(result?.message || "Could not update wishlist");
        }

        toast.success("Wishlist updated successfully", { id: toastId });
      }

      closeFormModal();
      setSelectedWishlist(null);
      await refreshWishlists();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to save wishlist", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteWishlist = (wishlist: Wishlist) => {
    setWishlistToDelete(wishlist);
  };

  const handleDeleteWishlist = async () => {
    if (!wishlistToDelete) return;

    const toastId = toast.loading("Deleting wishlist...");
    setSaving(true);

    try {
      const res = await axiosInstance.delete(
        `/api/v1/interviewer/wishlist/delete-wishlist/${wishlistToDelete.id}`,
        { withCredentials: true },
      );

      const result = res.data as {
        statusCode?: number;
        message?: string;
        data?: Wishlist | null;
      };

      if (!result?.data) {
        throw new Error(result?.message || "Could not delete wishlist");
      }

      toast.success("Wishlist deleted successfully", { id: toastId });
      setWishlistToDelete(null);
      setSelectedWishlist(null);
      await refreshWishlists();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to delete wishlist", {
        id: toastId,
      });
    } finally {
      setSaving(false);
    }
  };

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
          loading wishlists...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="space-y-5 mono font-mono">
      <div className="flex items-center justify-between gap-2 mono font-mono">
        <div className="flex items-center gap-3 w-full">
          <div
            className={`${Colors.background.primary} ${Colors.text.primary} rounded-md flex items-center gap-2.5 px-3.5 py-2.25 w-full transition-colors duration-200`}
          >
            <Search
              className={`${Colors.text.special}`}
              size={14}
              style={{ opacity: 0.6, flexShrink: 0 }}
            />
            <input
              placeholder="Search wishlists…"
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
            onClick={openCreateModal}
            className={` ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} cursor-pointer font-semibold flex items-center gap-2 px-2 text-sm py-2 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]`}
          >
            <Plus size={15} />
            Add Wishlist
          </button>
        </div>
      </div>

      <div
        style={{ borderRadius: "18px", overflow: "hidden" }}
        className={`${Colors.background.secondary} ${Colors.border.defaultThin}`}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 2.5fr 1.2fr 100px",
            padding: "12px 20px",
          }}
          className={`${Colors.border.defaultThinBottom} ${Colors.background.primary} ${Colors.text.primary} font-mono font-semibold`}
        >
          {["Wishlist", "Description", "Created", ""].map((h, i) => (
            <span
              key={i}
              className="iv-tag-header font-mono"
              style={{ textAlign: i === 3 ? "right" : "left" }}
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
              no wishlists found
            </p>
          </div>
        ) : (
          filtered.map((wishlist, idx) => (
            <div
              key={wishlist.id}
              onClick={() => router.push(`/wishlist/${wishlist.id}`)}
              className={`iv-row cursor-pointer transition-colors font-mono ${Colors.text.primary} ${Colors.hover.special} ${idx < filtered.length - 1 ? Colors.border.specialThinBottom : ""}`}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2.5fr 1.2fr 100px",
                padding: "14px 20px",
                alignItems: "center",
                animationDelay: `${idx * 40}ms`,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">{wishlist.name}</span>
                <ChevronRight
                  size={13}
                  className="iv-chevron"
                  color="#64e5af"
                />
              </div>

              <span
                style={{ fontSize: "0.84rem" }}
                className={`${Colors.text.primary} opacity-70 wrap-break-word`}
              >
                {wishlist.description ?? "No description"}
              </span>

              <span
                style={{ fontSize: "0.84rem" }}
                className={`${Colors.text.primary} opacity-70`}
              >
                {wishlist.createdAt
                  ? new Date(wishlist.createdAt).toLocaleDateString()
                  : "-"}
              </span>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWishlist(wishlist);
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
                    openEditModal(wishlist);
                  }}
                  className="iv-btn iv-btn-ghost cursor-pointer"
                  title="Edit"
                >
                  <Pencil
                    size={18}
                    className="hover:text-gray-400 transition-colors duration-100 active:scale-90 cursor-pointer"
                  />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDeleteWishlist(wishlist);
                  }}
                  className="iv-btn iv-btn-danger cursor-pointer"
                  title="Delete"
                >
                  <Trash2
                    size={18}
                    className="hover:text-red-700 transition-colors duration-100 active:scale-90 cursor-pointer"
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedWishlist ? (
        <Modal onClose={() => setSelectedWishlist(null)}>
          <button
            onClick={() => setSelectedWishlist(null)}
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
              {selectedWishlist.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "1rem" }}>
                {selectedWishlist.name}
              </p>
              <p
                style={{ fontSize: "0.75rem" }}
                className={`${Colors.text.special} opacity-80`}
              >
                Wishlist Details
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6 font-mono">
            <Field
              icon={ListChecks}
              label="Wishlist"
              value={selectedWishlist.name}
            />
            <Field
              icon={FileText}
              label="Description"
              value={selectedWishlist.description ?? "No description"}
            />
            <Field
              icon={Calendar}
              label="Created At"
              value={
                selectedWishlist.createdAt
                  ? new Date(selectedWishlist.createdAt).toLocaleDateString()
                  : "-"
              }
            />
          </div>

          <div className="flex justify-end gap-3 font-mono">
            <button
              onClick={() => setSelectedWishlist(null)}
              className={` ${Colors.text.primary} ${Colors.properties.interactiveButton} ${Colors.border.defaultThin} font-semibold flex items-center gap-2 px-2 py-2 rounded-lg font-mono`}
            >
              Close
            </button>
            <button
              onClick={() => openEditModal(selectedWishlist)}
              className={` ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} font-semibold flex items-center gap-2 px-2 py-2 rounded-lg font-mono`}
            >
              <Pencil size={16} />
              Edit
            </button>
            <button
              onClick={() => confirmDeleteWishlist(selectedWishlist)}
              className={` ${Colors.border.defaultThin} ${Colors.text.primary} ${Colors.properties.interactiveButton} font-semibold flex items-center gap-2 px-2 py-2 rounded-lg font-mono`}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </Modal>
      ) : null}

      {formMode ? (
        <Modal onClose={closeFormModal}>
          <button
            onClick={closeFormModal}
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
              <Plus size={11} />{" "}
              {formMode === "create" ? "New Wishlist" : "Edit Wishlist"}
            </div>
            <h2 style={{ fontWeight: 700, fontSize: "1.15rem" }}>
              {formMode === "create" ? "Add Wishlist" : "Update Wishlist"}
            </h2>
            <p
              style={{ fontSize: "0.82rem", marginTop: 3 }}
              className={`${Colors.text.primary} opacity-50`}
            >
              {formMode === "create"
                ? "Create a new wishlist for your interviewer workspace."
                : "Update the wishlist name or description."}
            </p>
          </div>

          <div className="space-y-3 mb-6 font-mono">
            <div className="space-y-1.5 font-mono">
              <label
                style={{
                  fontSize: "0.72rem",
                  fontFamily: "'DM Mono', monospace",
                }}
                className={`block ${Colors.text.special}`}
              >
                Wishlist Name
              </label>
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData((current) => ({
                    ...current,
                    name: e.target.value,
                  }))
                }
                placeholder="e.g. Frontend Developers"
                className={`w-full rounded-xl px-4 py-3 ${Colors.background.primary} ${Colors.text.primary} ${Colors.border.specialThin} outline-none placeholder:text-white/35`}
              />
            </div>

            <div className="space-y-1.5 font-mono">
              <label
                style={{
                  fontSize: "0.72rem",
                  fontFamily: "'DM Mono', monospace",
                }}
                className={`block ${Colors.text.special}`}
              >
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((current) => ({
                    ...current,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the purpose of this wishlist"
                rows={5}
                className={`w-full rounded-xl px-4 py-3 ${Colors.background.primary} ${Colors.text.primary} ${Colors.border.specialThin} outline-none placeholder:text-white/35 resize-none`}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 font-mono">
            <button
              onClick={closeFormModal}
              className={` ${Colors.text.primary} ${Colors.properties.interactiveButton} ${Colors.border.defaultThin} font-semibold flex items-center gap-2 px-2 py-2 rounded-lg font-mono`}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveWishlist}
              disabled={saving}
              className={` ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} font-semibold flex items-center gap-2 px-2 py-2 rounded-lg font-mono disabled:opacity-60`}
            >
              {saving
                ? "Saving..."
                : formMode === "create"
                  ? "Create Wishlist"
                  : "Save Changes"}
            </button>
          </div>
        </Modal>
      ) : null}

      {wishlistToDelete ? (
        <Modal onClose={() => setWishlistToDelete(null)}>
          <button
            onClick={() => setWishlistToDelete(null)}
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
              <Trash2 size={11} /> Confirm Delete
            </div>
            <h2 style={{ fontWeight: 700, fontSize: "1.15rem" }}>
              Delete Wishlist?
            </h2>
            <p
              style={{ fontSize: "0.82rem", marginTop: 3 }}
              className={`${Colors.text.primary} opacity-50`}
            >
              This will permanently remove{" "}
              <span className="font-semibold">{wishlistToDelete.name}</span>.
            </p>
          </div>

          <div className="flex justify-end gap-3 font-mono">
            <button
              onClick={() => setWishlistToDelete(null)}
              className={` ${Colors.text.primary} ${Colors.properties.interactiveButton} ${Colors.border.defaultThin} font-semibold flex items-center gap-2 px-2 py-2 rounded-lg font-mono`}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteWishlist}
              disabled={saving}
              className={` ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} font-semibold flex items-center gap-2 px-2 py-2 rounded-lg font-mono disabled:opacity-60`}
            >
              {saving ? "Deleting..." : "Delete Wishlist"}
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
