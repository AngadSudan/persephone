"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import { Plus } from "lucide-react";
import Spinner from "@/components/General/Spinner";

type Interviewer = {
  id: string;
  name: string;
  username: string;
  tagline: string;
  email: string;
  profileUrl: string;
  bannerUrl: string;
};

export default function InterviewerInfo() {
  const [data, setData] = useState<Interviewer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const Colors = useColors();

  const getData = async () => {
    try {
      const res = await fetch(backendUrl + "/api/v1/interviewers/get-profile", {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (data && !data.bannerUrl && !data.tagline) {
    return (
      <>
        <div className="font-mono flex flex-col gap-8 items-center justify-center h-full">
          <p className={`${Colors.text.secondary} text-sm`}>
            No profile information available.
          </p>
          <button
            className={`${Colors.properties.interactiveButton} ${Colors.border.specialThick} rounded-full p-6`}
            onClick={() => setIsEditModalOpen(true)}
          >
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
      {/* <input
        ref={resumeInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleResumeUpload(file);
        }}
      /> */}

      {data?.bannerUrl && (
        <div className="relative mb-5 overflow-hidden rounded-xl">
          <Image
            src={data?.bannerUrl}
            alt="Banner"
            width={1200}
            height={360}
            className="h-36 w-full object-cover sm:h-40 md:h-44"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/20" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/80 via-transparent to-transparent" />
        </div>
      )}

      <div
        className={`flex flex-col items-start gap-1.5 mb-3 ${Colors.text.primary}`}
      >
        <p className={`text-sm ${Colors.text.secondary} italic leading-relaxed`}>
          {data?.tagline}
        </p>
        <h2 className="text-lg font-semibold tracking-tight">{data?.name}</h2>
      </div>
      <div className="flex relative items-center justify-between bottom-0">
        <h1 className={`text-base md:text-lg font-medium ${Colors.text.primary}`}>
          {data?.email}
        </h1>
      </div>
    </div>
  );
}
