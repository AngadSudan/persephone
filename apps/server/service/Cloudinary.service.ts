import { v2 as cloudinary } from "cloudinary";
import type { FileHandler } from "../utils/interface";

class CloudinaryService implements FileHandler {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  async uploadFile(
    file: any,
    folder: string,
    filename: string,
  ): Promise<string | null> {
    try {
      if (!file || !file.buffer) {
        throw new Error("File with buffer is required");
      }

      const fileBase64 = file.buffer.toString("base64");
      const dataUri = `data:${file.mimetype};base64,${fileBase64}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: folder,
        resource_type: "auto",
        type: "upload",
        filename_override: filename,
      });

      if (!result || !result.secure_url) {
        throw new Error("Failed to get upload response from Cloudinary");
      }

      return result.secure_url;
    } catch (error) {
      console.log("UPLOAD FAILED:", error);
      return null;
    }
  }

  async deleteFile(fileUrl: string): Promise<string | null> {
    try {
      if (!fileUrl) throw new Error("No URL provided");

      const publicId = this.extractFileId(fileUrl);
      if (!publicId) throw new Error("Invalid Cloudinary URL");

      const response = await cloudinary.uploader.destroy(publicId);

      if (response.result !== "ok") throw new Error("error in deleting file");

      return "File deleted successfully";
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  extractFileId(fileUrl: string): string {
    try {
      const url = new URL(fileUrl);
      const pathname = url.pathname;
      return pathname
        .split("/")
        .slice(2)
        .join("/")
        .replace(/\.[^/.]+$/, "");
    } catch (error) {
      console.error("Invalid Cloudinary URL:", fileUrl);
      return "";
    }
  }
}

const cloudinaryService = new CloudinaryService();
export default cloudinaryService;