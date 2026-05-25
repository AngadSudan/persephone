"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import { Plus } from "lucide-react";
import Spinner from "@/components/General/Spinner";

type Organization = {
  id: string;
  name: string;
  username: string;
  tagline: string;
  email: string;
  profileUrl: string;
  bannerUrl: string;
};

export default function OrganizationInfo() {
  const [data, setData] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const Colors = useColors();
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const getData = async () => {
    try {
      const res = await fetch(backendUrl + "/api/v1/organizations/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res) throw new Error("Unable to get Data");

      const result = await res.json();
      console.log("Data fetch success:", result.data);
      setData(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && resumeOpen) {
        setResumeOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resumeOpen]);

  const handleResumeUpload = async (file: File) => {
    const toastId = toast.loading("Uploading Resume...");
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch(`${backendUrl}/api/v1/organizations/upload-resume`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const result = await res.json();

      if (!result.data?.resume) {
        throw new Error(result.message || "Upload failed");
      }

      setData((prev) =>
        prev
          ? {
            ...prev,
            resume: `${result.data.resume}?t=${Date.now()}`,
          }
          : prev,
      );
      toast.success("Upload Success!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Unable to Upload", { id: toastId });
    }
  };



  if (loading) {
    return <div className="flex items-center justify-center h-full"><Spinner /></div>;
  }

  if (data && !data.bannerUrl && !data.tagline) {
    return (
      <>
        <div className="font-mono flex flex-col gap-8 items-center justify-center h-full">
          <p className={`${Colors.text.secondary} text-sm`}>
            No profile information available.
          </p>
          <button className={`${Colors.properties.interactiveButton} ${Colors.border.specialThick} rounded-full p-6`} onClick={() => setIsEditModalOpen(true)}>
            <Plus className={`${Colors.text.special}`} size={40} />
          </button>
          <p className={`${Colors.text.secondary} text-sm`}>
            Tell others about yourself.
          </p>
        </div>

      </>
    );
  }

  return (
    <div className="font-mono">
      {/* Hidden resume input */}
      <input
        ref={resumeInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleResumeUpload(file);
        }}
      />

      {data?.bannerUrl && (
        <div>
          <Image
            src={data?.bannerUrl}
            alt="Banner"
            width={600}
            height={200}
            className="w-full relative inset-0 h-30 object-cover z-0 rounded-lg mb-4"
          />
        </div>
      )}

      <div
        className={`rounded-lg ${Colors.background.secondary} ${Colors.border.defaultThin} p-4`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={`text-xs uppercase tracking-widest ${Colors.text.secondary}`}>
              Company Profile
            </p>
            <h2 className={`text-2xl font-semibold leading-tight ${Colors.text.primary} truncate`}>
              {data?.name || "-"}
            </h2>
            {data?.username && (
              <p className={`text-sm mt-1 ${Colors.text.secondary}`}>
                @{data.username}
              </p>
            )}
          </div>

          <div className={`h-12 w-12 rounded-full ${Colors.border.fadedThin} ${Colors.text.primary} flex items-center justify-center text-lg font-semibold shrink-0`}>
            {data?.name?.[0]?.toUpperCase() || "C"}
          </div>
        </div>

        {data?.tagline && (
          <p className={`mt-3 text-sm italic ${Colors.text.secondary}`}>
            {data.tagline}
          </p>
        )}

        <div className={`mt-4 pt-3 ${Colors.border.defaultThinTop}`}>
          <p className={`text-xs uppercase tracking-wider ${Colors.text.secondary}`}>
            Contact Email
          </p>
          <h3 className={`text-base font-medium ${Colors.text.primary} break-all`}>
            {data?.email || "-"}
          </h3>
        </div>
      </div>



    </div>
  );
}
