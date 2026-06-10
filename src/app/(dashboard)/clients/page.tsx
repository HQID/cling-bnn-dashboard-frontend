"use client";

import { useState } from "react";
import Link from "next/link";
import { useClients, useCreateClient } from "@/hooks/use-api";
import { formatDate } from "@/lib/utils";
import {
  Search,
  Plus,
  Loader2,
  ChevronRight,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createClientSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  name: z.string().min(1, "Name is required"),
  client_identifier: z.string().min(1, "Client ID is required"),
  age: z.preprocess(
    (val) => {
      if (val === "" || val === undefined || val === null) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().min(12, "Age must be at least 12").max(99, "Age must be under 100").optional()
  ),
  substance_type: z.string().optional(),
  daily_frequency: z.number().min(0).optional(),
  daily_cost: z.number().min(0).optional(),
  monthly_spending: z.number().min(0).optional(),
});

type CreateClientFormData = z.infer<typeof createClientSchema>;
type CreateClientFormInput = z.input<typeof createClientSchema>;

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: clientsData, isLoading } = useClients(search);
  const createClient = useCreateClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientFormInput, any, CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
  });

  const onSubmit = async (data: CreateClientFormData) => {
    try {
      await createClient.mutateAsync(data);
      setShowCreateModal(false);
      reset();
    } catch (error) {
      console.error("Failed to create client:", error);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Manage BNN rehabilitation program clients
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by email or client ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-background py-2 pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Client List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Client ID</th>
                <th className="p-4 font-medium">Substance</th>
                <th className="p-4 font-medium">Streak</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Created</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {clientsData?.data.map((client) => (
                <tr
                  key={client.uid}
                  className="border-b last:border-0 hover:bg-muted/50"
                >
                  <td className="p-4 text-sm">{client.email}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {client.bnn_client_id || "-"}
                  </td>
                  <td className="p-4 text-sm">
                    {client.substance_type || "-"}
                  </td>
                  <td className="p-4 text-sm">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                      {client.clings_stats.streak_days} days
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${client.bnn_status === "bnn_client"
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-gray-500/10 text-gray-500"
                        }`}
                    >
                      {client.bnn_status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {formatDate(client.created_at)}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/clients/${client.uid}`}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      View
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {clientsData?.data.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No clients found
            </div>
          )}
        </div>
      )}

      {/* Create Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New Client</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Email *
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="client@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Password *
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

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Name *
                  </label>
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
                    Client ID / NIK *
                  </label>
                  <input
                    {...register("client_identifier")}
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="NIK or BNN reg number"
                  />
                  {errors.client_identifier && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.client_identifier.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Age
                  </label>
                  <input
                    {...register("age")}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="25"
                  />
                  {errors.age && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.age.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Substance Type
                  </label>
                  <input
                    {...register("substance_type")}
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="e.g., methamphetamine"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createClient.isPending}
                  className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {createClient.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}