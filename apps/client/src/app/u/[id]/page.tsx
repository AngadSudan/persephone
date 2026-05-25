"use client";
import AnyUser from "@/components/AnyUser/AnyUser";
import UserAppShell from "@/components/General/layouts/UserAppShell";
import { useParams } from "next/navigation";
import React from "react";

function Page() {
  const params = useParams<{ id: string }>();
  return (
    <UserAppShell>
      <AnyUser username={params.id} />
    </UserAppShell>
  );
}

export default Page;
