"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import { useColors } from "@/components/General/(Color Manager)/useColors";

export default function InterviewerList() {
    const Colors = useColors();
    const router = useRouter();
    const [totalInterviewers, setTotalInterviewers] = useState<number | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchInterviewersCount() {
            try {
                const res = await axiosInstance.get("/api/v1/organizations/get-interviewers-count");
                console.log('res', res)
                if (mounted) {
                    setTotalInterviewers(res.data?.data?.totalInterviewers ?? 0);
                }
            } catch (error) {
                console.error("Failed to fetch interviewers count", error);
                if (mounted) {
                    setTotalInterviewers(0);
                }
            }
        }

        fetchInterviewersCount();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <button
            onClick={() => router.push("/org-dashboard/interviewers")}
            type="button"
            className={`
          group
          cursor-pointer
          rounded-xl
          border ${Colors.border.fadedThin}
          ${Colors.background.secondary}
          p-4
          h-full
          w-full
          flex flex-col justify-between
          text-left
          transition-all duration-200
          hover:border-white/20
          hover:bg-white/6
          hover:-translate-y-0.5 font-mono
        `}
        >
            <div className="flex items-start justify-between gap-3 font-mono">
                <div>
                    <p className={`text-xs uppercase tracking-[0.2em] ${Colors.text.secondary}`}>
                        Total Organization Interviewers
                    </p>
                    <h2 className={`mt-2 text-3xl font-semibold ${Colors.text.primary}`}>
                        {totalInterviewers === null ? "--" : totalInterviewers}
                    </h2>
                </div>

                <div className={`rounded-full border border-white/10 px-3 py-1 text-xs ${Colors.text.secondary}`}>
                    View all
                </div>
            </div>

            <div className="mt-4">
                <p className={`text-sm ${Colors.text.primary} font-medium`}>
                    Organization Interviewers
                </p>
                <p className={`text-sm ${Colors.text.secondary} mt-1`}>
                    View and manage Organization interviewers.
                </p>
            </div>
        </button>
    );
}