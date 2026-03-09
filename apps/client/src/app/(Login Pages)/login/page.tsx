"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user-store";
import toast from "react-hot-toast";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const { setData } = useUserStore();
  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);

      const res = await fetch(backendUrl + "/api/v1/auth/login/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      console.log(data);
      if (!res.ok) throw new Error("Invalid credentials");

      const result = await res.json();
      console.log("Login success:", result);
      setData(result.data.data);
      console.log(result.data);
      toast.success("Logged in successfully!");
      router.push("/profile");
    } catch (err) {
      console.error(err);
      toast.error("Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh bg-black overflow-hidden px-4 py-4 md:px-6 md:py-6 font-mono">
      <div className="mx-auto grid h-full w-full max-w-7xl items-center gap-6 lg:grid-cols-2">
        <div className="relative hidden h-full min-h-80 overflow-hidden rounded-2xl lg:block">
        <Image
          src="/loginpng.jpg"
          alt="Login"
          fill
          className="object-cover object-center"
          priority
        />
      </div>
      <div className="relative mx-auto w-full max-w-md">
        <div className="absolute inset-0 rounded-2xl bg-emerald-500 blur-2xl opacity-20"></div>

        <div className="relative max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-emerald-500/30 bg-[#0a0a0a] p-6 shadow-2xl md:p-8">
          {/* Header */}
          <div className="mb-6 text-center md:mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-gray-400 mt-2 text-sm">Login to your account</p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-300">Email</label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+$/,
                    message: "Invalid email format",
                  },
                })}
                className="w-full mt-1 px-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:border-emerald-500"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-300">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white pr-12 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right text-sm">
              <Link
                href="/forgot-password"
                className="text-emerald-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-400">
            Don’t have an account?{" "}
            <Link href="/register" className="text-white hover:underline">
              Sign up
            </Link>
          </div>

          {/* Divider */}
          <div className="my-5 flex items-center">
            <div className="grow border-t border-gray-700" />
            <span className="px-4 text-xs text-gray-500">OR</span>
            <div className="grow border-t border-gray-700" />
          </div>

          {/* Social Login */}
          <div className="flex justify-center">
            <button
              onClick={() =>
                (window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/github`)
              }
              className="p-3 bg-black border border-gray-700 rounded-full hover:border-emerald-500 hover:scale-105 transition"
            >
              <img
                src="https://www.svgrepo.com/show/512317/github-142.svg"
                alt="GitHub"
                className="w-6 h-6 invert"
              />
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
