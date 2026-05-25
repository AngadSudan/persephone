import React from "react";
import { useColors } from "@/components/General/(Color Manager)/useColors";

interface fnHandler {
  filter: any;
  setFilter: any;
}

function Filter({ filter, setFilter }: fnHandler) {
  const Colors = useColors();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setFilter((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <div
      className={`w-full p-4 rounded-xl flex flex-wrap gap-4 items-center ${Colors.background.secondary} ${Colors.border.fadedThin}`}
    >
      {/* Organization */}
      <input
        name="org"
        value={filter.org}
        onChange={handleChange}
        placeholder="Search by organization..."
        className={`px-4 py-2 rounded-lg outline-none w-[220px] ${Colors.background.primary} ${Colors.text.primary} ${Colors.border.fadedThin}`}
      />

      {/* Candidate Name */}
      <input
        name="name"
        value={filter.name}
        onChange={handleChange}
        placeholder="Search by interviewer..."
        className={`px-4 py-2 rounded-lg outline-none w-[220px] ${Colors.background.primary} ${Colors.text.primary} ${Colors.border.fadedThin}`}
      />

      {/* Start Date */}
      <input
        type="date"
        name="startDate"
        value={filter.startDate}
        onChange={handleChange}
        className={`px-4 py-2 rounded-lg outline-none ${Colors.background.primary} ${Colors.text.primary} ${Colors.border.fadedThin}`}
      />

      {/* Clear Button */}
      <button
        onClick={() =>
          setFilter({
            org: "",
            name: "",
            startDate: "",
          })
        }
        className={`px-4 py-2 rounded-lg ${Colors.background.accent} ${Colors.text.inverted} ${Colors.properties.interactiveButton}`}
      >
        Clear
      </button>
    </div>
  );
}

export default Filter;
