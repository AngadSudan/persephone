import React from "react";
import { useColors } from "@/components/General/(Color Manager)/useColors";

export type InterviewFilters = {
  search: string;
  startDate: string;
  status: "ALL" | "PENDING" | "UNDER_PROGRESS";
  timeframe: "ALL" | "CURRENT" | "UPCOMING";
};

interface FilterProps {
  filter: InterviewFilters;
  setFilter: React.Dispatch<React.SetStateAction<InterviewFilters>>;
}

function Filter({ filter, setFilter }: FilterProps) {
  const Colors = useColors();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;

    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <div
      className="premium-subtle-panel flex flex-wrap items-center gap-3 rounded-[1.5rem] p-4"
    >
      <input
        name="search"
        value={filter.search}
        onChange={handleChange}
        placeholder="Search by interviewer or round..."
        className={`min-w-[220px] flex-1 rounded-2xl px-4 py-3 outline-none ${Colors.background.primary} ${Colors.text.primary} ${Colors.border.fadedThin}`}
      />

      <input
        type="date"
        name="startDate"
        value={filter.startDate}
        onChange={handleChange}
        className={`rounded-2xl px-4 py-3 outline-none ${Colors.background.primary} ${Colors.text.primary} ${Colors.border.fadedThin}`}
      />

      <select
        name="status"
        value={filter.status}
        onChange={handleChange}
        className={`rounded-2xl px-4 py-3 outline-none ${Colors.background.primary} ${Colors.text.primary} ${Colors.border.fadedThin}`}
      >
        <option value="ALL">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="UNDER_PROGRESS">In Progress</option>
      </select>

      <select
        name="timeframe"
        value={filter.timeframe}
        onChange={handleChange}
        className={`rounded-2xl px-4 py-3 outline-none ${Colors.background.primary} ${Colors.text.primary} ${Colors.border.fadedThin}`}
      >
        <option value="ALL">All Time</option>
        <option value="CURRENT">Current</option>
        <option value="UPCOMING">Upcoming</option>
      </select>

      <button
        onClick={() =>
          setFilter({
            search: "",
            startDate: "",
            status: "ALL",
            timeframe: "ALL",
          })
        }
        className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
      >
        Clear
      </button>
    </div>
  );
}

export default Filter;
