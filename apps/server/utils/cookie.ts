import type { Request, Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const buildAuthCookieOptions = (req: Request) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  path: "/",
});

export const setAccessTokenCookie = (
  req: Request,
  res: Response,
  token: string,
) => {
  res.cookie("accessToken", token, buildAuthCookieOptions(req));
};

export const clearAccessTokenCookie = (req: Request, res: Response) => {
  res.clearCookie("accessToken", buildAuthCookieOptions(req));
};

export const setResetTokenCookie = (
  req: Request,
  res: Response,
  token: string,
) => {
  res.cookie("resetToken", token, buildAuthCookieOptions(req));
};
