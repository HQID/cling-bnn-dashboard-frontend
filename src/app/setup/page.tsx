"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle } from "lucide-react";
import { useFirstTimeSetup } from "@/hooks/use-api";

const setupSchema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    setup_secret: z.string().min(1, "Secret wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type SetupFormData = z.infer<typeof setupSchema>;

export default function SetupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const setupMutation = useFirstTimeSetup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
  });

  const onSubmit = async (data: SetupFormData) => {
    try {
      setError(null);
      await setupMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
        setup_secret: data.setup_secret,
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal membuat akun";
      setError(message);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-text-primary">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <h2 className="mb-2 text-xl font-bold tracking-tight text-text-primary">
            Akun berhasil dibuat!
          </h2>
          <p className="text-sm text-text-secondary">
            Mengalihkan ke halaman masuk...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2.5">
          <span className="text-4xl">🔥</span>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Cling
          </h1>
          <p className="text-sm text-text-secondary">
            Buat akun super admin pertama
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-[14px] bg-error-light px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {/* Setup Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-[13px] font-semibold text-text-primary"
            >
              Nama Lengkap
            </label>
            <input
              {...register("name")}
              type="text"
              id="name"
              placeholder="Nama lengkap"
              className="w-full rounded-[16px] border border-transparent bg-off-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-error">{errors.name.message}</p>
            )}
          </div>

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
              <p className="mt-1 text-xs text-error">{errors.email.message}</p>
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

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-[13px] font-semibold text-text-primary"
            >
              Konfirmasi Password
            </label>
            <input
              {...register("confirmPassword")}
              type="password"
              id="confirmPassword"
              placeholder="••••••••"
              className="w-full rounded-[16px] border border-transparent bg-off-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-error">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="setup_secret"
              className="mb-1.5 block text-[13px] font-semibold text-text-primary"
            >
              Secret Setup
            </label>
            <input
              {...register("setup_secret")}
              type="password"
              id="setup_secret"
              placeholder="Masukkan secret"
              className="w-full rounded-[16px] border border-transparent bg-off-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary"
            />
            {errors.setup_secret && (
              <p className="mt-1 text-xs text-error">
                {errors.setup_secret.message}
              </p>
            )}
            <p className="mt-1 text-[11px] text-text-tertiary">
              Secret ini diberikan oleh administrator sistem
            </p>
          </div>

          <button
            type="submit"
            disabled={setupMutation.isPending}
            className="mt-1 flex h-11 w-full items-center justify-center rounded-[14px] bg-text-primary text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {setupMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Membuat akun...
              </span>
            ) : (
              "Buat Akun Super Admin"
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center text-sm text-text-tertiary">
          Sudah punya akun?{" "}
          <a
            href="/login"
            className="font-medium text-text-primary hover:underline"
          >
            Masuk
          </a>
        </div>
      </div>
    </div>
  );
}
