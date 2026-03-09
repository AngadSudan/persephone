"use client";
import InterviewSuite from "@/components/InterviewSuite/InterviewSuite";
import { useParams } from "next/navigation";

//fetch the interview-suite based on a job listing
function page() {
  const params = useParams<{ id: string }>();
  return <InterviewSuite id={params.id} />;
}

export default page;
