import axiosInstance from "@/utils/axiosInstance";

export const applyToJob = async (jobId:string,resume:File)=>{
    const formData = new FormData();

    formData.append("resume",resume);

    const res = await axiosInstance.post(
        `/api/v1/jobListing/apply-to-job/${jobId}`,
        formData,
        {
            headers:{
                "Content-Type":"multipart/form-data",
            },
        }
    );

    return res.data.data;
}