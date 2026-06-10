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
  Flame,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NumberStepper } from "@/components/number-stepper";

const substanceOptions = [
  { value: "methamphetamine", label: "Metamfetamin", description: "Sabu-sabu, kristal" },
  { value: "cannabis", label: "Ganja", description: "Mariyuana, THC" },
  { value: "opioid", label: "Opioid", description: "Heroin, morfin, fentanil" },
  { value: "amphetamine", label: "Amfetamin", description: "Ekstasi, MDMA" },
  { value: "benzodiazepine", label: "Benzodiazepin", description: "Diazepam, alprazolam" },
  { value: "inhalant", label: "Inhalan", description: "Lem, thinner, gas" },
  { value: "cocaine", label: "Kokain", description: "Kokain hidroklorida" },
  { value: "other", label: "Lainnya", description: "Zat lain" },
];

const createClientSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Minimal 8 karakter"),
  name: z.string().min(1, "Nama wajib diisi"),
  client_identifier: z.string().min(1, "ID Klien wajib diisi"),
  age: z.number().min(12, "Usia minimal 12").max(99, "Usia maksimal 99").optional(),
  substance_type: z.string().optional(),
  daily_frequency: z.number().min(0).optional(),
  daily_cost: z.number().min(0).optional(),
  monthly_spending: z.number().min(0).optional(),
});

type CreateClientFormData = z.infer<typeof createClientSchema>;

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: clientsData, isLoading } = useClients(search);
  const createClient = useCreateClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      age: undefined,
      substance_type: undefined,
    },
  });

  const onSubmit = async (data: CreateClientFormData) => {
    try {
      await createClient.mutateAsync(data);
      setShowCreateModal(false);
      reset();
    } catch (error) {
      console.error("Gagal membuat klien:", error);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Klien
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Kelola klien program rehabilitasi BNN
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex h-10 items-center gap-2 rounded-[14px] bg-text-primary px-5 text-sm font-semibold text-white transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Tambah Klien
        </button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Cari berdasarkan email atau ID klien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[16px] border border-transparent bg-off-white py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary"
          />
        </div>
      </div>

      {/* Client List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-grey200 border-t-text-primary" />
        </div>
      ) : (
        <div className="rounded-[20px] bg-grey50 p-5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey100">
                <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Email
                </th>
                <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  ID Klien
                </th>
                <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Zat
                </th>
                <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Streak
                </th>
                <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Status
                </th>
                <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Dibuat
                </th>
                <th className="pb-2.5" />
              </tr>
            </thead>
            <tbody>
              {clientsData?.data.map((client) => (
                <tr
                  key={client.uid}
                  className="border-b border-grey100 last:border-0"
                >
                  <td className="py-3 text-sm text-text-primary">
                    {client.email}
                  </td>
                  <td className="py-3 text-sm text-text-secondary">
                    {client.bnn_client_id || "-"}
                  </td>
                  <td className="py-3 text-sm text-text-secondary">
                    {client.substance_type || "-"}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-primary">
                      <Flame className="h-3.5 w-3.5 text-vibrant-orange" />
                      {client.clings_stats.streak_days} hari
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex rounded-full bg-grey100 px-2.5 py-1 text-[11px] font-semibold text-grey700">
                      {client.bnn_status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-text-secondary">
                    {formatDate(client.created_at)}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/clients/${client.uid}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-text-primary hover:underline"
                    >
                      Detail
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {clientsData?.data.length === 0 && (
            <div className="py-12 text-center text-sm text-text-tertiary">
              Tidak ada klien ditemukan
            </div>
          )}
        </div>
      )}

      {/* Create Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[20px] bg-background p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-text-primary">
                Tambah Klien Baru
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-grey50 text-grey500 transition-colors hover:bg-grey100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div className="grid gap-3.5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                    Email *
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full rounded-[16px] border border-transparent bg-off-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary"
                    placeholder="klien@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-error">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                    Password *
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

                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                    Nama *
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
                    ID Klien / NIK *
                  </label>
                  <input
                    {...register("client_identifier")}
                    type="text"
                    className="w-full rounded-[16px] border border-transparent bg-off-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary"
                    placeholder="NIK atau nomor registrasi"
                  />
                  {errors.client_identifier && (
                    <p className="mt-1 text-xs text-error">
                      {errors.client_identifier.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Age Stepper */}
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                  Usia
                </label>
                <Controller
                  control={control}
                  name="age"
                  render={({ field }) => (
                    <NumberStepper
                      value={field.value ?? 20}
                      onChange={field.onChange}
                      min={12}
                      max={99}
                    />
                  )}
                />
                {errors.age && (
                  <p className="mt-1 text-xs text-error">
                    {errors.age.message}
                  </p>
                )}
              </div>

              {/* Substance Type Selection */}
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                  Jenis Zat
                </label>
                <Controller
                  control={control}
                  name="substance_type"
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2">
                      {substanceOptions.map((opt) => {
                        const isSelected = field.value === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => field.onChange(opt.value)}
                            className={`flex items-center gap-2.5 rounded-[12px] border px-3.5 py-2.5 text-left transition-all duration-200 ${
                              isSelected
                                ? "border-text-primary bg-text-primary text-white"
                                : "border-grey200 bg-grey50 text-text-primary"
                            }`}
                          >
                            <div
                              className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all duration-200 ${
                                isSelected
                                  ? "border-white bg-white"
                                  : "border-grey300 bg-transparent"
                              }`}
                            >
                              {isSelected && (
                                <div className="h-2 w-2 rounded-full bg-text-primary" />
                              )}
                            </div>
                            <span className="text-[13px] font-medium leading-tight">
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
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
                  disabled={createClient.isPending}
                  className="flex h-11 items-center gap-2 rounded-[14px] bg-text-primary px-5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {createClient.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Buat Klien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
