import { useColors } from "@/components/General/(Color Manager)/useColors";
import Sidebar from "@/components/General/Sidebar";
import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useState } from "react";
import Filter from "./Filter";
import Interviews from "./Interviews";

function IndividualInterviewV1() {
  const Colors = useColors();
  const [interview, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [filter, setFilter] = useState({
    search: "",
    startDate: "",
  });
  async function fetchInterviews() {
    const res = await axiosInstance.get(
      `/api/v1/interview/interview-suite/interview/get-all-user-interview`,
    );

    console.log(res.data);
    setInterviews([]);
  }

  useEffect(() => {
    let data = [...interview];

    // Combined search (interviewer name OR organization)
    if (filter.search) {
      const query = filter.search.toLowerCase();

      data = data.filter((item: any) => {
        const interviewerName = item?.interviewer?.name?.toLowerCase() || "";

        const orgName =
          item?.interviewer?.Organization?.name?.toLowerCase() || "";

        return interviewerName.includes(query) || orgName.includes(query);
      });
    }

    // Filter by start date
    if (filter.startDate) {
      const selectedDate = new Date(filter.startDate);

      data = data.filter((item: any) => {
        const interviewDate = new Date(item.createdAt);
        return interviewDate >= selectedDate;
      });
    }

    setFilteredInterviews(data);
  }, [filter, interview]);

  useEffect(() => {
    fetchInterviews();
  }, []);
  return (
    <div
      className={`w-full h-screen overflow-hidden p-4 ${Colors.background.primary}`}
    >
      <div className="grid h-full min-h-0 grid-cols-8 grid-rows-1 gap-5 overflow-hidden">
        <div className="h-full min-h-0 col-span-2">
          <Sidebar />
        </div>

        <div className="h-full min-h-0 space-y-4 overflow-y-auto pr-1 col-span-6">
          <Filter filter={filter} setFilter={setFilter} />

          <Interviews data={filteredInterviews} />
        </div>
      </div>
    </div>
  );
}

export default IndividualInterviewV1;
