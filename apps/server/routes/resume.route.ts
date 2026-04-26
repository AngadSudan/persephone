import { Router } from 'express';
import upload from '../middleware/multer.middleware';
import { uploadResumeHandler } from '../controller/resume.controller';

const router = Router();

router.post(
  '/upload',
  upload.single('file'),
  uploadResumeHandler,
);

export default router;