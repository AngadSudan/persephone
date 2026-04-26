import type { Request, Response, NextFunction } from 'express';
import { parseAndStoreResume } from '../service/resume-parser.service';

export async function uploadResumeHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthenticated.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded. Use field name "resume".' });
      return;
    }

    const result = await parseAndStoreResume(
      userId,
      req.file.buffer,
      req.file.mimetype,
    );

    res.status(200).json(result);
  } catch (err: any) {
    // Categorise errors for meaningful HTTP codes
    if (err.message.includes('too short') || err.message.includes('empty')) {
      res.status(422).json({ success: false, error: err.message });
      return;
    }

    if (err.message.includes('YAML') || err.message.includes('Gemini')) {
      res.status(502).json({ success: false, error: err.message });
      return;
    }

    if (err.message.includes('not found')) {
      res.status(404).json({ success: false, error: err.message });
      return;
    }

    // Unexpected – pass to global error handler
    next(err);
  }
}

//THIS CAN BE USED FOR QUICK TESTING - just replace the userId with the userId that comes on console when u login

// import type { Request, Response, NextFunction } from 'express';
// import { parseAndStoreResume } from '../service/resume-parser.service';

// export async function uploadResumeHandler(
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): Promise<void> {
//   try {
//     const userId = "69edaf548ffdbd0921f56c46";

//     if (!req.file) {
//       res.status(400).json({
//         success: false,
//         error: 'No file uploaded. Use field name "file".',
//       });
//       return;
//     }

//     const result = await parseAndStoreResume(
//       userId,
//       req.file.buffer,
//       req.file.mimetype,
//     );

//     res.status(200).json(result);
//   } catch (err: any) {
//     if (err.message.includes('too short') || err.message.includes('empty')) {
//       res.status(422).json({ success: false, error: err.message });
//       return;
//     }

//     if (err.message.includes('YAML') || err.message.includes('Gemini')) {
//       res.status(502).json({ success: false, error: err.message });
//       return;
//     }

//     if (err.message.includes('not found')) {
//       res.status(404).json({ success: false, error: err.message });
//       return;
//     }

//     next(err);
//   }
// }
