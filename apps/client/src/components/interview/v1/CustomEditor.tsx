"use client";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import { RemoteUser, useRemoteUsers } from "agora-rtc-react";
import { useMemo } from "react";

function CustomEditor() {
  const colors = useColors();
  const remoteUsers = useRemoteUsers();
  const activeVideoUser = useMemo(
    () => remoteUsers.find((user) => user.hasVideo) ?? remoteUsers[0],
    [remoteUsers],
  );

  if (!activeVideoUser) {
    return (
      <div
        className={`
          h-full w-full flex items-center justify-center
          ${colors.background.secondary}
          ${colors.text.secondary}
          ${colors.border.fadedThin}
          rounded-md
        `}
      >
        Waiting for candidate to stream their screen. Make sure they are sharing
        their entire screen.
      </div>
    );
  }

  return (
    <div
      className={`
        h-full w-full relative overflow-hidden
        ${colors.background.primary}
        ${colors.border.defaultThin}
        rounded-md
      `}
    >
      <RemoteUser
        user={activeVideoUser}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
        videoPlayerConfig={{ fit: "contain" }}
      />
    </div>
  );
}

export default CustomEditor;
