import React from "react";
import { useColors } from "@/components/General/(Color Manager)/useColors";

interface fnHandler {
  data: any[];
}

function Interviews({ data }: fnHandler) {
  const Colors = useColors();

  if (!data || data.length === 0) {
    return (
      <div
        className={`w-full p-6 text-center rounded-xl ${Colors.background.secondary} ${Colors.text.secondary} ${Colors.border.fadedThin}`}
      >
        No interviews found
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {data.map((item, index) => (
        <div
          key={item.id || index}
          className={`w-full p-4 rounded-xl flex justify-between items-center ${Colors.background.secondary} ${Colors.border.fadedThin}`}
        >
          {/* LEFT SECTION */}
          <div className="flex flex-col gap-1">
            <p className={`${Colors.text.primary} font-semibold`}>
              {item?.interviewer?.name || "Unknown Interviewer"}
            </p>

            <p className={`text-sm ${Colors.text.secondary}`}>
              {item?.interviewer?.Organization?.name || "Unknown Org"}
            </p>

            <p className={`text-xs ${Colors.text.secondary}`}>
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-sm rounded-full ${Colors.background.accent} ${Colors.text.inverted}`}
            >
              {item?.interviewStatus}
            </span>

            <button
              className={`px-4 py-2 rounded-lg ${Colors.border.specialThin} ${Colors.text.special} ${Colors.properties.interactiveButton}`}
            >
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Interviews;
