"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user-store";

export default function OAuthSuccess() {
  const router = useRouter();
  const { setData } = useUserStore();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/is-authenticated`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.authenticated) {
        setData(data.user);
        router.push("/");
      } else {
        router.push("/login");
      }
    };

    checkAuth();
  }, []);

  return <div className="text-white text-center mt-20">Logging you in...</div>;
}