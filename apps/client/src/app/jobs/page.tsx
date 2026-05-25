import React from "react";
import Jobs from "@/components/Jobs/Jobs";
import UserAppShell from "@/components/General/layouts/UserAppShell";

const page = () => {
  return (
    <UserAppShell>
      <Jobs />
    </UserAppShell>
  );
};

export default page;
