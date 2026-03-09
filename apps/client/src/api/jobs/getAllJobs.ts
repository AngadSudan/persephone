import axiosInstance from "@/utils/axiosInstance";

export const getAllJobs = async ()=>{
    const res = await axiosInstance.get("/api/v1/jobListing/get-all-job-listing");

    return res.data.data;
}