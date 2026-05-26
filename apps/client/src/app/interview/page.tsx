"use client";
import UserAppShell from "@/components/General/layouts/UserAppShell";
import IndividualInterview from "@/components/IndividualInterview/IndividualInterview";

function page() {
  return (
    <UserAppShell>
      <IndividualInterview />;
    </UserAppShell>
  );
}

export default page;
