"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  User,
  Pencil,
  DoorOpen,
  Building2,
  Briefcase,
  Heart,
  Mail,
  X,
} from "lucide-react";
import ThemeSwitcher from "@/components/General/(Color Manager)/ThemeSwitcher";
import { useColors } from "@/components/General/(Color Manager)/useColors";

type InterviewerWishlist = {
  id: string;
  name: string;
  description?: string;
};

type InterviewerJobListing = {
  id: string;
};

type InterviewerProfile = {
  id: string;
  name: string;
  username: string;
  email: string;
  profileUrl: string;
  bannerUrl: string;
  headline?: string | null;
  userInfo?: string | null;
  orgId: string;
  wishlists: InterviewerWishlist[];
  jobListings: InterviewerJobListing[];
};

type EditFormData = {
  name: string;
  username: string;
  headline: string;
};

export default function SideSection() {
  const Colors = useColors();
  const router = useRouter();

  const [data, setData] = useState<InterviewerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    name: "",
    username: "",
    headline: "",
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  async function getData() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/interviewers/get-profile`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      const result = await res.json();

      if (!res.ok || result?.statusCode >= 400) {
        throw new Error(
          result?.message || "Unable to fetch interviewer profile",
        );
      }

      setData(result.data ?? null);
    } catch (err) {
      console.error(err);
      toast.error("Unable to fetch interviewer profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  const uploadProfilePic = async (file: File) => {
    const toastId = toast.loading("Uploading profile picture...");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("profilePic", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/interviewers/update-ProfilePic`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        },
      );

      const result = await res.json();

      if (!res.ok || result?.statusCode >= 400) {
        throw new Error(result?.message || "Upload failed");
      }

      if (!result.data?.profileUrl) {
        throw new Error("Upload failed");
      }

      setData((prev) =>
        prev
          ? {
              ...prev,
              profileUrl: `${result.data.profileUrl}?t=${Date.now()}`,
            }
          : prev,
      );

      toast.success("Upload Success!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Unable to Upload", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  async function handleLogout() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/logout`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error("Logout Failed");
      }

      localStorage.clear();
      toast.success("Logged Out Successfully!");
      router.replace("/");
    } catch (error) {
      console.error(error);
      toast.error("Logout Failed");
    }
  }

  const openEditModal = () => {
    if (data) {
      setEditFormData({
        name: data.name,
        username: data.username,
        headline: data.headline || "",
      });
      setBannerFile(null);
      setIsEditModalOpen(true);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setBannerFile(null);
  };

  const handleSaveProfile = async () => {
    if (!editFormData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!editFormData.username.trim()) {
      toast.error("Username is required");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Updating profile...");

    try {
      // Update basic info
      const updateRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/interviewers/update-user-info`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: editFormData.name.trim(),
            username: editFormData.username.trim(),
            headline: editFormData.headline.trim(),
          }),
        },
      );

      const updateResult = await updateRes.json();

      if (!updateRes.ok || updateResult?.statusCode >= 400) {
        throw new Error(updateResult?.message || "Failed to update profile");
      }

      // Update banner if selected
      if (bannerFile) {
        const formData = new FormData();
        formData.append("Banner", bannerFile);

        const bannerRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/interviewers/update-banner`,
          {
            method: "PUT",
            credentials: "include",
            body: formData,
          },
        );

        const bannerResult = await bannerRes.json();

        if (!bannerRes.ok || bannerResult?.statusCode >= 400) {
          throw new Error(bannerResult?.message || "Failed to update banner");
        }

        if (bannerResult.data?.bannerUrl) {
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  bannerUrl: `${bannerResult.data.bannerUrl}?t=${Date.now()}`,
                }
              : prev,
          );
        }
      }

      // Refresh profile data
      await getData();
      toast.success("Profile updated successfully", { id: toastId });
      closeEditModal();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to update profile", {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const wishlistCount = data?.wishlists?.length ?? 0;
  const listingCount = data?.jobListings?.length ?? 0;

  return (
    <div
      className={`${Colors.background.secondary} w-full min-h-full p-4 flex flex-col justify-between rounded-xl font-mono gap-4`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadProfilePic(file);
        }}
      />

      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setBannerFile(file);
        }}
      />

      <div className="space-y-4">
        <div className="flex justify-center mb-4">
          <div
            className={`relative w-40 h-40 md:w-44 md:h-44 rounded-full overflow-hidden ${Colors.background.primary} group cursor-pointer flex items-center justify-center ${uploading ? "opacity-70" : ""}`}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {data?.profileUrl ? (
              <img
                src={data.profileUrl}
                alt="Profile"
                className="block w-full h-full object-cover rounded-full leading-none transition-all duration-200 group-hover:blur-sm group-hover:opacity-60"
              />
            ) : (
              <User className="w-24 h-24 text-white transition-all duration-200 group-hover:blur-sm group-hover:opacity-60" />
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Pencil className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div
          className={`${Colors.background.primary} rounded-xl px-4 py-3 space-y-2`}
        >
          <p className={`${Colors.text.primary} text-2xl leading-none`}>
            {data?.name ?? "Interviewer"}
          </p>
          <p className={`text-md ${Colors.text.secondary} font-bold`}>
            @{data?.username ?? "username"}
          </p>
          <p className={`${Colors.text.secondary} text-sm`}>
            {data?.headline?.trim() || "Interviewer"}
          </p>
        </div>

        <div
          className={`${Colors.background.primary} rounded-xl px-4 py-3 space-y-3`}
        >
          <div className="flex items-center gap-2">
            <Mail size={16} className={Colors.text.special} />
            <span className={`${Colors.text.primary} text-sm break-all`}>
              {data?.email ?? "No email"}
            </span>
          </div>
        </div>

        {/* <div className="grid grid-cols-2 gap-3">
          <div className={`${Colors.background.primary} rounded-xl p-3`}>
            <div className="flex items-center gap-2 mb-1">
              <Heart size={16} className={Colors.text.special} />
              <p className={`${Colors.text.secondary} text-xs`}>Wishlists</p>
            </div>
            <p className={`${Colors.text.primary} text-2xl font-semibold`}>{loading ? "--" : wishlistCount}</p>
          </div>
          <div className={`${Colors.background.primary} rounded-xl p-3`}>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase size={16} className={Colors.text.special} />
              <p className={`${Colors.text.secondary} text-xs`}>Job Listings</p>
            </div>
            <p className={`${Colors.text.primary} text-2xl font-semibold`}>{loading ? "--" : listingCount}</p>
          </div>
        </div> */}

        <div className={`${Colors.background.primary} rounded-xl px-4 py-3`}>
          <p
            className={`${Colors.text.secondary} text-xs uppercase tracking-[0.16em] mb-2`}
          >
            Headline
          </p>
          <p className={`${Colors.text.primary} text-sm leading-relaxed`}>
            {data?.headline?.trim() || "No profile headline added yet."}
          </p>
        </div>

        {wishlistCount > 0 ? (
          <div className={`${Colors.background.primary} rounded-xl px-4 py-3`}>
            <p
              className={`${Colors.text.secondary} text-xs uppercase tracking-[0.16em] mb-2`}
            >
              Recent Wishlist
            </p>
            <p className={`${Colors.text.primary} text-sm`}>
              {data?.wishlists?.[0]?.name ?? "-"}
            </p>
          </div>
        ) : null}

        {/* <div className="flex justify-center items-center">
          <Link
            href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/github`}
            className={`flex gap-3 cursor-pointer p-2 rounded-md ${Colors.background.special} ${Colors.text.inverted}`}
          >
            Connect to Github
          </Link>
        </div> */}
      </div>

      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={openEditModal}
            className={`${Colors.background.special} ${Colors.properties.interactiveButton} flex-1 py-3 rounded-xl flex items-center justify-center`}
          >
            <Pencil className={`${Colors.text.inverted}`} />
            <span className={`ml-2 ${Colors.text.inverted} font-semibold`}>
              Edit Profile
            </span>
          </button>
          <button
            onClick={handleLogout}
            className={`${Colors.background.special} ${Colors.properties.interactiveButton} flex-1 py-3 rounded-xl flex items-center justify-center`}
          >
            <DoorOpen className={`${Colors.text.inverted}`} />
            <span className={`ml-2 ${Colors.text.inverted} font-semibold`}>
              Logout
            </span>
          </button>
        </div>
      </div>

      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,19,19,0.85)] backdrop-blur-[6px] font-mono"
          onClick={closeEditModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: "0 0 60px #64e5af15, 0 24px 48px rgba(0,0,0,0.6)",
              animation: "modalIn 0.2s cubic-bezier(.22,1,.36,1)",
            }}
            className={`w-full max-w-md rounded-2xl p-7 relative ${Colors.background.secondary} ${Colors.text.primary}`}
          >
            <button
              onClick={closeEditModal}
              style={{ position: "absolute", top: 18, right: 18 }}
              className={`cursor-pointer transition-colors ${Colors.text.primary} opacity-40 hover:opacity-100`}
            >
              <X size={16} />
            </button>

            <div className="mb-6 font-mono">
              <h2 style={{ fontWeight: 700, fontSize: "1.15rem" }}>
                Update Your Profile
              </h2>
              <p
                style={{ fontSize: "0.82rem", marginTop: 3 }}
                className={`${Colors.text.primary} opacity-50`}
              >
                Modify your profile information and banner
              </p>
            </div>

            <div className="space-y-3 mb-6 font-mono">
              {/* Banner Upload */}
              <div className="space-y-1.5">
                <label
                  style={{
                    fontSize: "0.72rem",
                    fontFamily: "'DM Mono', monospace",
                  }}
                  className={`block ${Colors.text.special}`}
                >
                  Banner Image
                </label>
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className={`w-full rounded-xl px-4 py-3 ${Colors.background.primary} ${Colors.text.primary} ${Colors.border.specialThin} outline-none text-sm hover:opacity-80 transition-opacity`}
                >
                  {bannerFile ? bannerFile.name : "Choose Banner Image"}
                </button>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label
                  style={{
                    fontSize: "0.72rem",
                    fontFamily: "'DM Mono', monospace",
                  }}
                  className={`block ${Colors.text.special}`}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Your name"
                  className={`w-full rounded-xl px-4 py-3 ${Colors.background.primary} ${Colors.text.primary} ${Colors.border.specialThin} outline-none placeholder:text-white/35`}
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label
                  style={{
                    fontSize: "0.72rem",
                    fontFamily: "'DM Mono', monospace",
                  }}
                  className={`block ${Colors.text.special}`}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={editFormData.username}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="Your username"
                  className={`w-full rounded-xl px-4 py-3 ${Colors.background.primary} ${Colors.text.primary} ${Colors.border.specialThin} outline-none placeholder:text-white/35`}
                />
              </div>

              {/* Headline */}
              <div className="space-y-1.5">
                <label
                  style={{
                    fontSize: "0.72rem",
                    fontFamily: "'DM Mono', monospace",
                  }}
                  className={`block ${Colors.text.special}`}
                >
                  Headline
                </label>
                <input
                  type="text"
                  value={editFormData.headline}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      headline: e.target.value,
                    }))
                  }
                  placeholder="Your professional headline"
                  className={`w-full rounded-xl px-4 py-3 ${Colors.background.primary} ${Colors.text.primary} ${Colors.border.specialThin} outline-none placeholder:text-white/35`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 font-mono">
              <button
                onClick={closeEditModal}
                className={` ${Colors.text.primary} ${Colors.properties.interactiveButton} ${Colors.border.defaultThin} font-semibold flex items-center gap-2 px-4 py-2 rounded-lg font-mono`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className={` ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} font-semibold flex items-center gap-2 px-4 py-2 rounded-lg font-mono disabled:opacity-60`}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <style>{`
              @keyframes modalIn {
                from { opacity: 0; transform: scale(0.95) translateY(8px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}
