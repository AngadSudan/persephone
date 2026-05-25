import React from "react";
import Feed from "@/components/Feed/Feed";
import UserAppShell from "@/components/General/layouts/UserAppShell";
const page = () => {
  return (
    <UserAppShell>
      <Feed />
    </UserAppShell>
  );
};

export default page;
