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
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  name: z.string().min(1, "Name is required"),
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
      console.error("Failed to create admin:", error);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and admin accounts
        </p>
      </div>

      {/* Profile Section */}
      <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Your Profile</h2>
        {profile && (
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Name</dt>
              <dd className="text-sm font-medium">{profile.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="text-sm font-medium">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Role</dt>
              <dd>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  <Shield className="h-3 w-3" />
                  {profile.role}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Created</dt>
              <dd className="text-sm font-medium">
                {formatDate(profile.created_at)}
              </dd>
            </div>
          </dl>
        )}
      </div>

      {/* Admin Management (Super Admin Only) */}
      {isSuperAdmin && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Admin Accounts</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Admin
            </button>
          </div>

          {adminsLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {admins?.map((admin) => (
                  <tr key={admin.uid} className="border-b last:border-0">
                    <td className="py-3 text-sm">{admin.name}</td>
                    <td className="py-3 text-sm">{admin.email}</td>
                    <td className="py-3 text-sm">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        <Shield className="h-3 w-3" />
                        {admin.role}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New Admin</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  {...register("name")}
                  type="text"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Full name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Email
                </label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="admin@bnn.go.id"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Password
                </label>
                <input
                  {...register("password")}
                  type="password"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Min 8 characters"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAdmin.isPending}
                  className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {createAdmin.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
