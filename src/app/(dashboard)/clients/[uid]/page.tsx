"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useClient,
  useDeactivateClient,
  useResetClientPassword,
  useClientCompletedQuests,
} from "@/hooks/use-api";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Key,
  Trash2,
  Loader2,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Video,
  File,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

export default function ClientDetailPage() {
  const params = useParams();
  const clientUid = params["uid"] as string;
  const { data: client, isLoading } = useClient(clientUid);
  const deactivateClient = useDeactivateClient(clientUid);
  const resetPassword = useResetClientPassword(clientUid);
  const { data: completedQuests } = useClientCompletedQuests(clientUid);

  const [showResetPassword, setShowResetPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-grey200 border-t-text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-text-secondary">Klien tidak ditemukan</p>
      </div>
    );
  }

  const handleResetPassword = async () => {
    try {
      await resetPassword.mutateAsync(newPassword);
      setShowResetPassword(false);
      setNewPassword("");
      setStatusMessage({
        type: "success",
        message: "Password berhasil direset",
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: "Gagal mereset password",
      });
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateClient.mutateAsync();
      window.location.href = "/clients";
    } catch (error) {
      console.error("Gagal menonaktifkan klien:", error);
    }
  };

  return (
    <div>
      {/* Status Message */}
      {statusMessage && (
        <div
          className={`mb-4 rounded-[14px] px-4 py-3 text-sm ${
            statusMessage.type === "success"
              ? "bg-grey50 text-success"
              : "bg-error-light text-error"
          }`}
        >
          {statusMessage.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <Link
          href="/clients"
          className="mb-4 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Klien
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              {client.name || client.email}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">{client.email}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/clients/${clientUid}/program`}
              className="flex h-10 items-center gap-2 rounded-[14px] border border-grey200 px-4 text-sm font-semibold text-text-primary transition-all hover:bg-grey50"
            >
              <Edit className="h-4 w-4" />
              {client.has_program ? "Edit Program" : "Buat Program"}
            </Link>
            <button
              onClick={() => setShowResetPassword(true)}
              className="flex h-10 items-center gap-2 rounded-[14px] border border-grey200 px-4 text-sm font-semibold text-text-primary transition-all hover:bg-grey50"
            >
              <Key className="h-4 w-4" />
              Reset Password
            </button>
            <button
              onClick={() => setShowDeactivate(true)}
              className="flex h-10 items-center gap-2 rounded-[14px] border border-error px-4 text-sm font-semibold text-error transition-all hover:bg-error-light"
            >
              <Trash2 className="h-4 w-4" />
              Nonaktifkan
            </button>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-[20px] bg-grey50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">
            Informasi Klien
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-text-tertiary">ID Klien</dt>
              <dd className="text-sm font-medium text-text-primary">
                {client.bnn_client_id || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Usia</dt>
              <dd className="text-sm font-medium text-text-primary">
                {client.age || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Jenis Zat</dt>
              <dd className="text-sm font-medium text-text-primary">
                {client.substance_type || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Frekuensi Harian</dt>
              <dd className="text-sm font-medium text-text-primary">
                {client.daily_frequency || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Biaya Harian</dt>
              <dd className="text-sm font-medium text-text-primary">
                {client.daily_cost ? formatCurrency(client.daily_cost) : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Pengeluaran Bulanan</dt>
              <dd className="text-sm font-medium text-text-primary">
                {client.monthly_spending
                  ? formatCurrency(client.monthly_spending)
                  : "-"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-[20px] bg-grey50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">
            Status Program
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-text-tertiary">Status</dt>
              <dd>
                <span className="inline-flex rounded-full bg-grey100 px-2.5 py-1 text-[11px] font-semibold text-grey700">
                  {client.bnn_status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Program</dt>
              <dd className="text-sm font-medium text-text-primary">
                {client.has_program ? "Sudah ada" : "Belum ada"}
              </dd>
            </div>
            {client.program_estimates && (
              <>
                <div>
                  <dt className="text-xs text-text-tertiay">
                    Pemulihan Parsial
                  </dt>
                  <dd className="text-sm font-medium text-text-primary">
                    {client.program_estimates.partial_recovery_days} hari
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-tertiary">
                    Pemulihan Penuh
                  </dt>
                  <dd className="text-sm font-medium text-text-primary">
                    {client.program_estimates.full_recovery_days} hari
                  </dd>
                </div>
              </>
            )}
            <div>
              <dt className="text-xs text-text-tertiary">Admin Ditugaskan</dt>
              <dd className="text-sm font-medium text-text-primary">
                {client.bnn_assigned_admin || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-text-tertiary">Dibuat</dt>
              <dd className="text-sm font-medium text-text-primary">
                {formatDate(client.created_at)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-[16px] bg-grey50 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-text-tertiary">
            <Flame className="h-3.5 w-3.5 text-vibrant-orange" />
            Streak Saat Ini
          </div>
          <p className="text-2xl font-bold tracking-tight text-text-primary">
            {client.stats.current_streak}
          </p>
        </div>
        <div className="rounded-[16px] bg-grey50 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-text-tertiary">
            <TrendingUp className="h-3.5 w-3.5" />
            Streak Terpanjang
          </div>
          <p className="text-2xl font-bold tracking-tight text-text-primary">
            {client.stats.longest_streak}
          </p>
        </div>
        <div className="rounded-[16px] bg-grey50 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-text-tertiary">
            <Calendar className="h-3.5 w-3.5" />
            Quest Selesai
          </div>
          <p className="text-2xl font-bold tracking-tight text-text-primary">
            {client.stats.total_quests_completed}
          </p>
        </div>
        <div className="rounded-[16px] bg-grey50 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-text-tertiary">
            <TrendingUp className="h-3.5 w-3.5" />
            Progres
          </div>
          <p className="text-2xl font-bold tracking-tight text-text-primary">
            {client.stats.program_progress_pct}%
          </p>
        </div>
        <div className="rounded-[16px] bg-grey50 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-text-tertiary">
            <AlertTriangle className="h-3.5 w-3.5" />
            Relapse
          </div>
          <p className="text-2xl font-bold tracking-tight text-text-primary">
            {client.stats.relapse_count}
          </p>
        </div>
        <div className="rounded-[16px] bg-grey50 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-text-tertiary">
            <Calendar className="h-3.5 w-3.5" />
            Terakhir Aktif
          </div>
          <p className="text-sm font-medium text-text-primary">
            {client.stats.last_active_date || "Belum pernah"}
          </p>
        </div>
      </div>

      {/* Triggers & Distractions */}
      <div className="grid gap-3 md:grid-cols-2">
        {client.triggers && client.triggers.length > 0 && (
          <div className="rounded-[20px] bg-grey50 p-5">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">
              Pemicu
            </h3>
            <div className="flex flex-wrap gap-2">
              {client.triggers.map((trigger) => (
                <span
                  key={trigger}
                  className="rounded-[10px] bg-grey100 px-3 py-1.5 text-xs font-semibold text-grey700"
                >
                  {trigger}
                </span>
              ))}
            </div>
          </div>
        )}

        {client.distractions && client.distractions.length > 0 && (
          <div className="rounded-[20px] bg-grey50 p-5">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">
              Pengalihan
            </h3>
            <div className="flex flex-wrap gap-2">
              {client.distractions.map((distraction) => (
                <span
                  key={distraction}
                  className="rounded-[10px] bg-grey100 px-3 py-1.5 text-xs font-semibold text-grey700"
                >
                  {distraction}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Completed Quests with Evidence */}
      {completedQuests && completedQuests.total_completed_with_evidence > 0 && (
        <div className="mt-4">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">
            Riwayat Quest dengan Bukti
          </h3>
          <div className="space-y-3">
            {Object.entries(completedQuests.quests_by_date)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, quests]) => (
                <div key={date} className="rounded-[16px] bg-grey50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-text-tertiary" />
                    <span className="text-xs font-semibold text-text-secondary">
                      {formatDate(date)}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      ({quests.length} quest)
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {quests.map((quest) => (
                      <div
                        key={quest.id}
                        className="rounded-[12px] bg-off-white p-3.5"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span className="text-sm font-medium text-text-primary">
                              {quest.title}
                            </span>
                            <span className="rounded-full bg-grey100 px-2 py-0.5 text-[10px] font-semibold text-grey600">
                              {quest.quest_type}
                            </span>
                          </div>
                          <span className="text-xs text-text-tertiary">
                            +{quest.xp_reward} XP
                          </span>
                        </div>
                        {quest.description && (
                          <p className="mb-2 text-xs text-text-secondary">
                            {quest.description}
                          </p>
                        )}
                        {/* Evidence files */}
                        {quest.evidence.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {quest.evidence.map((ev) => {
                              const isImage = ev.mime_type.startsWith("image/");
                              const isVideo = ev.mime_type.startsWith("video/");
                              const isPdf = ev.mime_type === "application/pdf";
                              return (
                                <a
                                  key={ev.id}
                                  href={ev.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 rounded-[10px] border border-grey200 bg-background px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-grey50"
                                >
                                  {isImage ? (
                                    <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
                                  ) : isVideo ? (
                                    <Video className="h-3.5 w-3.5 text-purple-500" />
                                  ) : isPdf ? (
                                    <FileText className="h-3.5 w-3.5 text-red-500" />
                                  ) : (
                                    <File className="h-3.5 w-3.5 text-grey500" />
                                  )}
                                  <span className="max-w-[120px] truncate">
                                    {ev.file_name}
                                  </span>
                                  <ExternalLink className="h-3 w-3 text-text-tertiary" />
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[20px] bg-background p-6">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-text-primary">
              Reset Password
            </h2>
            <div className="mb-5">
              <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                Password Baru
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-[16px] border border-transparent bg-off-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary"
                placeholder="Minimal 8 karakter"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetPassword(false)}
                className="h-11 rounded-[14px] border border-grey200 px-5 text-sm font-semibold text-text-primary transition-all hover:bg-grey50"
              >
                Batal
              </button>
              <button
                onClick={handleResetPassword}
                disabled={
                  resetPassword.isPending || newPassword.length < 8
                }
                className="flex h-11 items-center gap-2 rounded-[14px] bg-text-primary px-5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              >
                {resetPassword.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {showDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[20px] bg-background p-6">
            <h2 className="mb-2 text-lg font-bold tracking-tight text-text-primary">
              Nonaktifkan Klien
            </h2>
            <p className="mb-5 text-sm text-text-secondary">
              Apakah Anda yakin ingin menonaktifkan klien ini? Akun mereka akan
              dinonaktifkan dan tidak dapat mengakses aplikasi.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeactivate(false)}
                className="h-11 rounded-[14px] border border-grey200 px-5 text-sm font-semibold text-text-primary transition-all hover:bg-grey50"
              >
                Batal
              </button>
              <button
                onClick={handleDeactivate}
                disabled={deactivateClient.isPending}
                className="flex h-11 items-center gap-2 rounded-[14px] bg-error px-5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              >
                {deactivateClient.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Nonaktifkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
