import axiosInstance from "@/utils/axiosInstance";

export const getJobById = async (jobId:string)=>{
    const res = await axiosInstance.get(`/api/v1/jobListing/get-job-listing-by-id/${jobId}`);

    return res.data.data;
}