import type { Request, Response } from "express";
import apiResponse from "../utils/apiResponse";

class InterviewAnalyticsController {
  async getAllInterviewSuiteByUser(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async getAllInterviewRoundByUser(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async getInterviewRoundByUser(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
  async getInterviewRecordByUser(req: Request, res: Response) {
    try {
    } catch (error: any) {
      console.log(error);
      return res.status(200).json(apiResponse(500, error.message, null));
    }
  }
}
export default new InterviewAnalyticsController();
