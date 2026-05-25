import InterviewerAppShell from "@/components/General/layouts/InterviewerAppShell";

export default function InterviewerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InterviewerAppShell>{children}</InterviewerAppShell>;
}
