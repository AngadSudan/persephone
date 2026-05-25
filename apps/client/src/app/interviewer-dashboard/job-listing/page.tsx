import JobListingTable from "@/components/Interviewer/Profile/v1/JobListingTable";
import SideSection from "@/components/Interviewer/Profile/v1/SideSection";
import React from "react";

export default function page() {
  return (
    <div className="grid grid-cols-4 gap-4 p-4 h-screen">
      <div className="col-span-1 h-full">
        <SideSection />
      </div>
      <div className="col-span-3 h-full">
        <JobListingTable />
      </div>
    </div>
  );
}
