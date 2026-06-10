"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      setIsLoading(true);
      await signIn(data.email, data.password);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal masuk";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2.5">
          <span className="text-4xl">🔥</span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Cling
          </h1>
          <p className="text-sm text-text-secondary">
            Masuk ke dashboard BNN
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-[14px] bg-error-light px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[13px] font-semibold text-text-primary"
            >
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              placeholder="admin@bnn.go.id"
              className="w-full rounded-[16px] border border-transparent bg-off-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-error">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[13px] font-semibold text-text-primary"
            >
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              id="password"
              placeholder="••••••••"
              className="w-full rounded-[16px] border border-transparent bg-off-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-error">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 flex h-11 w-full items-center justify-center rounded-[14px] bg-text-primary text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Masuk...
              </span>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        {/* Setup Link */}
        <div className="mt-6 text-center text-sm text-text-tertiary">
          Pertama kali?{" "}
          <a
            href="/setup"
            className="font-medium text-text-primary hover:underline"
          >
            Buat akun admin
          </a>
        </div>
      </div>
    </div>
  );
}
