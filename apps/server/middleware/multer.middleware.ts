import multer from "multer";

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedExtensions = /\.(pdf|ppt|png|jpg|jpeg)$/i; // Case-insensitive

  if (!allowedExtensions.test(file.originalname)) {
    req.fileValidationError =
      "Only PDFs, and images (PNG, JPG, JPEG) are allowed!";
    return cb(new Error(req.fileValidationError), false);
  }

  cb(null, true);
};

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;
