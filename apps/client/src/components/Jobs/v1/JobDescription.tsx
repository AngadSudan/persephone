"use client";

import { Job } from "./JobListingPage";
import { useColors } from "@/components/General/(Color Manager)/useColors";

interface JobDescriptionProps {
  job: Job;
}

export default function JobDescription({ job }: JobDescriptionProps) {
  const Colors = useColors();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">About the job</h2>

      <p className="font-medium">Who We Are Is What We Do.</p>

      <p className={`${Colors.text.secondary}`}>
        Deel is the all-in-one payroll and HR platform for global teams. Our
        vision is to unlock global opportunity for every person, team, and
        business. Built for the way the world works today.
      </p>

      <p className={`${Colors.text.secondary}`}>
        Deel combines HRIS, payroll, compliance, benefits, performance, and
        equipment management into one seamless platform.
      </p>
    </div>
  );
}