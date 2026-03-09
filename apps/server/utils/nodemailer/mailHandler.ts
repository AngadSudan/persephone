import nodemailer from "nodemailer";
import { WELCOME_EMAIL, VERIFY_OTP, PASSWORD_RESET_OTP } from "./emailTemplate.ts";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface OTPEntry {
  otp: string;
  expiresAt: number;
}

interface OTPMapType {
  [email: string]: OTPEntry;
}

const OTP_MAP: OTPMapType = {}; // { email: { otp: '123456', expiresAt: 168383838383 } }

// Generate OTP for an email
export function generateOTP(email: string): OTPEntry {
  Object.keys(OTP_MAP).forEach(key => {
    if (OTP_MAP[key] && OTP_MAP[key].expiresAt < Date.now()) {
      delete OTP_MAP[key];
    }
  });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  OTP_MAP[email] = {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000 // expires in 10 minutes
  };
  return OTP_MAP[email];
}

// Verify OTP for an email
export function handleVerifyOTP(email: string, otp: string): boolean {

  if (!OTP_MAP[email])
    throw new Error("OTP isn't present");

  if (OTP_MAP[email].expiresAt < Date.now())
    throw new Error("OTP expired, Request a new OTP!");

  if (OTP_MAP[email].otp != otp) {
    throw new Error("Incorrect OTP");
  }

  delete OTP_MAP[email]; // Clear OTP after successful verification
  return true;
}

// Send password email
export async function handleSendMail(email: string, password: string): Promise<boolean> {
  const template = WELCOME_EMAIL.replace("{PASSWORD}", password).replace(
    "{EMAIL}",
    email,
  );

  await transporter.sendMail({
    from: `"Team Codex" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome email",
    html: template,
  });
  return true;
}

// Send OTP email with template
export async function handleSendOTPMail(email: string, templateId: string): Promise<boolean> {
  const { otp } = generateOTP(email);

  let template: string = '';
  let subject: string = 'Your Verification OTP';

  if (templateId === "welcome") {
    template = WELCOME_EMAIL.replace("{VERIFICATION_LINK}", "");
    subject = "Welcome to Codex";
  } else if (templateId === "email-otp-verification") {
    template = VERIFY_OTP.replace("{OTP}", otp);
    subject = "Your Email Verification OTP";
  } else if (templateId === "password-reset") {
    template = PASSWORD_RESET_OTP.replace("{OTP}", otp);
    subject = "Password Reset OTP";
  } else {
    template = VERIFY_OTP.replace("{OTP}", otp);
  }

  await transporter.sendMail({
    from: `"Team Codex" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: template
  });
  return true;
}
