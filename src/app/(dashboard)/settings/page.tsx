"use client";

import { useAuth } from "@/contexts/auth-context";
import { useAdminProfile, useAdmins, useCreateAdmin } from "@/hooks/use-api";
import { formatDate } from "@/lib/utils";
import { Loader2, Plus, Shield, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createAdminSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Minimal 8 karakter"),
  name: z.string().min(1, "Nama wajib diisi"),
});

type CreateAdminFormData = z.infer<typeof createAdminSchema>;

export default function SettingsPage() {
  const { isSuperAdmin } = useAuth();
  const { data: profile, isLoading: profileLoading } = useAdminProfile();
  const { data: admins, isLoading: adminsLoading } = useAdmins();
  const createAdmin = useCreateAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
  });

  const onSubmit = async (data: CreateAdminFormData) => {
    try {
      await createAdmin.mutateAsync(data);
      setShowCreateModal(false);
      reset();
    } catch (error) {
      console.error("Gagal membuat admin:", error);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-grey200 border-t-text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Pengaturan
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Kelola profil dan akun admin
        </p>
      </div>

      {/* Profile Section */}
      <div className="mb-4 rounded-[20px] bg-grey50 p-5">
        <h2 className="mb-4 text-sm font-semibold text-text-primary">
          Profil Anda
        </h2>
        {profile && (
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-xs text-text-tertiary">Nama</dt>
              <dd className="text-sm font-medium text-text-primary">
                {profile.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Email</dt>
              <dd className="text-sm font-medium text-text-primary">
                {profile.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Role</dt>
              <dd>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-grey100 px-2.5 py-1 text-[11px] font-semibold text-grey700">
                  <Shield className="h-3 w-3" />
                  {profile.role}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Dibuat</dt>
              <dd className="text-sm font-medium text-text-primary">
                {formatDate(profile.created_at)}
              </dd>
            </div>
          </dl>
        )}
      </div>

      {/* Admin Management (Super Admin Only) */}
      {isSuperAdmin && (
        <div className="rounded-[20px] bg-grey50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">
              Akun Admin
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex h-10 items-center gap-1.5 rounded-[14px] bg-text-primary px-4 text-sm font-semibold text-white transition-all hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Admin
            </button>
          </div>

          {adminsLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-grey200 border-t-text-primary" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-grey100">
                  <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Nama
                  </th>
                  <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Email
                  </th>
                  <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Role
                  </th>
                  <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Dibuat
                  </th>
                </tr>
              </thead>
              <tbody>
                {admins?.map((admin) => (
                  <tr
                    key={admin.uid}
                    className="border-b border-grey100 last:border-0"
                  >
                    <td className="py-3 text-sm text-text-primary">
                      {admin.name}
                    </td>
                    <td className="py-3 text-sm text-text-secondary">
                      {admin.email}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-grey100 px-2.5 py-1 text-[11px] font-semibold text-grey700">
                        <Shield className="h-3 w-3" />
                        {admin.role}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-text-secondary">
                      {formatDate(admin.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[20px] bg-background p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-text-primary">
                Tambah Admin Baru
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-grey50 text-grey500 transition-colors hover:bg-grey100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                  Nama
                </label>
                <input
                  {...register("name")}
                  type="text"
                  className="w-full rounded-[16px] border border-transparent bg-off-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary"
                  placeholder="Nama lengkap"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-error">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                  Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full rounded-[16px] border border-transparent bg-off-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary"
                  placeholder="admin@bnn.go.id"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-error">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                  Password
                </label>
                <input
                  {...register("password")}
                  type="password"
                  className="w-full rounded-[16px] border border-transparent bg-off-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary"
                  placeholder="Minimal 8 karakter"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-error">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-11 rounded-[14px] border border-grey200 px-5 text-sm font-semibold text-text-primary transition-all hover:bg-grey50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createAdmin.isPending}
                  className="flex h-11 items-center gap-2 rounded-[14px] bg-text-primary px-5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {createAdmin.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Buat Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
