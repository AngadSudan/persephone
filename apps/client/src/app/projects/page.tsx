import Projects from "@/components/Projects/Projects";
import React from "react";
import UserAppShell from "@/components/General/layouts/UserAppShell";

function page() {
  return (
    <UserAppShell>
      <Projects />
    </UserAppShell>
  );
}

export default page;
