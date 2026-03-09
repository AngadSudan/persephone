import jwt from "jsonwebtoken";
import type { JwtPayload } from "./type";
/**
 * take the useremail and id and hash them to generate the accesstoken with 1 day expiry
 * again hash the useremail and id to generate a refersh token with 20 day expiry
 */
export function generateFreshTokens(payload: JwtPayload) {
  const accessToken = generateAccessToken(payload);
  return { accessToken };
}
/**
 * incase when the access token gets expired, then generate a new accesstoken but before that check
 * for the refreshToken verification
 */
export function generateAccessToken(payload: JwtPayload) {
  //TODO: verify pre-existing refreshToken

  const options = {
    expiresIn: "1d", // Token expiration time
  };
  //@ts-ignore
  const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, options);
  return token;
}
/**
 * incase when the refresh token gets expired, then generate a new refreshtoken
 */
/**
 * decode the accessToken here.
 */
export function verifyAccessToken(accessToken: string) {
  try {
    return jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET as string,
    ) as JwtPayload;
  } catch (error) {
    throw new Error("invalid or expired access token");
  }
}

