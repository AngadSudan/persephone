"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

type User = {
  id: string;
  resume: string | null;
};

const Resume = () => {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const getData = async () => {
    try {
      const res = await fetch(
        backendUrl + "/api/v1/users/get-profile",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to fetch profile");

      const result = await res.json();
      console.log("This is resume data",result.data);
      setData(result.data); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);


  const handleResumeUpload = async (file: File) => {
    const toastId = toast.loading("Uploading Resume...");
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch(`${backendUrl}/api/v1/users/upload-resume`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const result = await res.json();

      if (!result.data?.resume) {
        throw new Error(result.message || "Upload failed");
      }

      setData((prev) =>
        prev
          ? {
              ...prev,
              resume: `${result.data.resume}?t=${Date.now()}`,
            }
          : prev,
      );
      toast.success("Upload Success!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Unable to Upload", { id: toastId });
    }
  };


  return (
    <div className="w-full max-w-xl">
      {!data?.resume ? (
        <label
          htmlFor="resume-upload"
          className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-300 rounded-lg h-64 cursor-pointer hover:border-gray-400 transition"
        >
          <Plus size={64} className="text-gray-400" />
          <p className="text-gray-500 font-medium">
            Upload Resume
          </p>

          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleResumeUpload(e.target.files[0]);
              }
            }}
          />
        </label>
      ) : (
        <div className="border rounded-lg p-4">
          <p className="font-semibold mb-2">Your Resume</p>

          <iframe
            src={data.resume}
            className="w-full h-96 rounded"
          />
        </div>
      )}
    </div>
  );
};

export default Resume;