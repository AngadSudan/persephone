"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, Mail, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useColors } from "@/components/General/(Color Manager)/useColors";
import toast from "react-hot-toast";
import axiosInstance from "@/utils/axiosInstance";

type EmailStepData = {
  email: string;
};

type OTPStepData = {
  otp: string;
};

type PasswordStepData = {
  password: string;
  confirmPassword: string;
};

type Step = "email" | "otp" | "password" | "success";

export default function ForgotPasswordV1() {
  const Colors = useColors();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email Step Form
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailStepData>();

  // OTP Step Form
  const {
    register: registerOTP,
    handleSubmit: handleSubmitOTP,
    formState: { errors: otpErrors },
  } = useForm<OTPStepData>();

  // Password Step Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch,
    formState: { errors: passwordErrors },
  } = useForm<PasswordStepData>();

  const password = watch("password");

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    const message = (error as any)?.response?.data?.message;
    return typeof message === "string" && message.length > 0
      ? message
      : fallback;
  };

  const sendForgotPasswordOtp = async (emailAddress: string) => {
    const res = await axiosInstance.post(
      "/api/v1/auth/forgot-password",
      { email: emailAddress },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (res?.data?.statusCode !== 200) {
      throw new Error(res?.data?.message || "Failed to send OTP.");
    }

    return res.data;
  };

  const onEmailSubmit = async (data: EmailStepData) => {
    try {
      setLoading(true);
      setEmail(data.email);

      await sendForgotPasswordOtp(data.email);
      toast.success("OTP sent to your email!");
      setCurrentStep("otp");
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, "Failed to send OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const onOTPSubmit = async (data: OTPStepData) => {
    try {
      setLoading(true);

      const res = await axiosInstance.post(
        "/api/v1/auth/verify-otp",
        {
          email,
          otp: data.otp,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (res?.data?.statusCode !== 200 || !res?.data?.data) {
        throw new Error(res?.data?.message || "OTP verification failed.");
      }

      setResetToken(res.data.data);
      toast.success("OTP verified!");
      setCurrentStep("password");
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, "Invalid OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordStepData) => {
    try {
      setLoading(true);

      if (!resetToken) {
        throw new Error("Reset token missing. Please verify OTP again.");
      }

      const res = await axiosInstance.post(
        "/api/v1/auth/reset-password",
        {
          resetToken,
          newPassword: data.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (res?.data?.statusCode !== 200) {
        throw new Error(res?.data?.message || "Failed to reset password.");
      }

      toast.success("Password reset successfully!");
      setCurrentStep("success");
    } catch (err) {
      console.error(err);
      toast.error(
        getApiErrorMessage(err, "Failed to reset password. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await sendForgotPasswordOtp(email);
      toast.success("OTP resent to your email!");
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, "Unable to resend OTP."));
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (currentStep === "otp") {
      setCurrentStep("email");
    } else if (currentStep === "password") {
      setCurrentStep("otp");
    }
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  return (
    <div
      className={`min-h-screen ${Colors.background.primary} flex items-center justify-center p-4 md:p-6 font-mono`}
    >
      <div className="relative w-full max-w-md">
        <div className={`absolute inset-0 rounded-2xl ${Colors.background.special} blur-2xl opacity-20`}></div>

        {/* Main Container */}
        <div
          className={`relative ${Colors.background.primary} ${Colors.border.specialThin} rounded-2xl p-6 md:p-8 shadow-2xl`}
        >
          {/* Progress Indicator */}
          <div className="mb-6 flex justify-between items-center">
            {["email", "otp", "password"].map((step, idx) => (
              <div key={step} className="flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${currentStep === step
                      ? `${Colors.background.special} ${Colors.text.inverted}`
                      : currentStep > step || step === "otp"
                        ? `${Colors.background.special} ${Colors.text.inverted}`
                        : `${Colors.background.secondary} ${Colors.text.secondary}`
                    }
                  `}
                >
                  {step === "email" && "1"}
                  {step === "otp" && "2"}
                  {step === "password" && "3"}
                </div>
                {idx < 2 && (
                  <div
                    className={`w-30 h-0.5 mx-2 ${currentStep > step || step === "otp"
                      ? `${Colors.background.special}`
                      : Colors.background.secondary
                      }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Email Step */}
          {currentStep === "email" && (
            <>
              <div className="mb-6 text-center md:mb-8">
                <div className="flex justify-center mb-3">
                  <Mail className={`w-10 h-10 ${Colors.text.special}`} />
                </div>
                <h1 className={`text-3xl font-bold ${Colors.text.primary}`}>
                  Reset Password
                </h1>
                <p className={`${Colors.text.secondary} mt-2 text-sm`}>
                  Enter your email address
                </p>
              </div>

              <form onSubmit={handleSubmitEmail(onEmailSubmit)} className="space-y-5">
                <div>
                  <label className={`text-sm ${Colors.text.secondary}`}>Email</label>
                  <input
                    {...registerEmail("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email format",
                      },
                    })}
                    placeholder="your@email.com"
                    className={`w-full mt-1 px-4 py-3 ${Colors.background.primary} ${Colors.border.defaultThin} rounded-lg ${Colors.text.primary} focus:outline-none transition-colors`}
                  />
                  {emailErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {emailErrors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} disabled:opacity-50`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className={`${Colors.text.secondary} text-sm`}>
                    Remember your password?{" "}
                    <Link
                      href="/login"
                      className={`${Colors.text.special} hover:underline font-semibold cursor-pointer`}
                    >
                      Login here
                    </Link>
                  </p>
                </div>
              </form>
            </>
          )}

          {/* OTP Step */}
          {currentStep === "otp" && (
            <>
              <div className="mb-6 text-center md:mb-8">
                <div className="flex justify-center mb-3">
                  <Lock className={`w-10 h-10 ${Colors.text.special}`} />
                </div>
                <h1 className={`text-3xl font-bold ${Colors.text.primary}`}>
                  Verify OTP
                </h1>
                <p className={`${Colors.text.secondary} mt-2 text-sm`}>
                  Enter the OTP sent to {email}
                </p>
              </div>

              <form onSubmit={handleSubmitOTP(onOTPSubmit)} className="space-y-5">
                <div>
                  <label className={`text-sm ${Colors.text.secondary}`}>
                    One-Time Password
                  </label>
                  <input
                    {...registerOTP("otp", {
                      required: "OTP is required",
                      pattern: {
                        value: /^\d{6}$/,
                        message: "OTP must be 6 digits",
                      },
                    })}
                    placeholder="000000"
                    maxLength={6}
                    className={`w-full mt-1 px-4 py-3 ${Colors.background.primary} ${Colors.border.defaultThin} rounded-lg ${Colors.text.primary} text-center text-2xl letter-spacing tracking-widest focus:outline-none transition-colors`}
                  />
                  {otpErrors.otp && (
                    <p className="text-red-500 text-xs mt-1">
                      {otpErrors.otp.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBackClick}
                    className={`flex-1 py-3 rounded-lg font-semibold ${Colors.border.defaultThin} ${Colors.text.primary} ${Colors.properties.interactiveButton} transition-colors`}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} disabled:opacity-50`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>

                <p className={`text-center ${Colors.text.secondary} text-xs`}>
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className={`${Colors.text.special} hover:underline font-semibold cursor-pointer`}
                  >
                    Resend OTP
                  </button>
                </p>
              </form>
            </>
          )}

          {/* Password Step */}
          {currentStep === "password" && (
            <>
              <div className="mb-6 text-center md:mb-8">
                <div className="flex justify-center mb-3">
                  <Lock className={`w-10 h-10 ${Colors.text.special}`} />
                </div>
                <h1 className={`text-3xl font-bold ${Colors.text.primary}`}>
                  Create New Password
                </h1>
                <p className={`${Colors.text.secondary} mt-2 text-sm`}>
                  Enter your new password
                </p>
              </div>

              <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-5">
                {/* Password */}
                <div>
                  <label className={`text-sm ${Colors.text.secondary}`}>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...registerPassword("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                      })}
                      placeholder="••••••••"
                      className={`w-full mt-1 px-4 py-3 pr-10 ${Colors.background.primary} ${Colors.border.defaultThin} rounded-lg ${Colors.text.primary} focus:outline-none transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${Colors.text.secondary} ${Colors.properties.interactiveButton}`}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {passwordErrors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={`text-sm ${Colors.text.secondary}`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...registerPassword("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                      placeholder="••••••••"
                      className={`w-full mt-1 px-4 py-3 pr-10 ${Colors.background.primary} ${Colors.border.defaultThin} rounded-lg ${Colors.text.primary} focus:outline-none transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${Colors.text.secondary} ${Colors.properties.interactiveButton}`}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBackClick}
                    className={`flex-1 py-3 rounded-lg font-semibold ${Colors.border.defaultThin} ${Colors.text.primary} ${Colors.properties.interactiveButton} transition-colors`}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} disabled:opacity-50`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Success Step */}
          {currentStep === "success" && (
            <>
              <div className="mb-6 text-center md:mb-8">
                <div className="flex justify-center mb-3">
                  <CheckCircle className={`w-12 h-12 ${Colors.text.special}`} />
                </div>
                <h1 className={`text-3xl font-bold ${Colors.text.primary}`}>
                  Success!
                </h1>
                <p className={`${Colors.text.secondary} mt-2 text-sm`}>
                  Your password has been reset successfully
                </p>
              </div>

              <button
                onClick={handleLoginRedirect}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton} disabled:opacity-50`}
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
