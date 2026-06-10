"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useClient,
  useDeactivateClient,
  useResetClientPassword,
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
} from "lucide-react";
import { useState } from "react";

export default function ClientDetailPage() {
  const params = useParams();
  const clientUid = params["uid"] as string;
  const { data: client, isLoading } = useClient(clientUid);
  const deactivateClient = useDeactivateClient(clientUid);
  const resetPassword = useResetClientPassword(clientUid);

  const [showResetPassword, setShowResetPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return <div>Client not found</div>;
  }

  const handleResetPassword = async () => {
    try {
      await resetPassword.mutateAsync(newPassword);
      setShowResetPassword(false);
      setNewPassword("");
      setStatusMessage({ type: "success", message: "Password reset successfully" });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      setStatusMessage({ type: "error", message: "Failed to reset password" });
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateClient.mutateAsync();
      window.location.href = "/clients";
    } catch (error) {
      console.error("Failed to deactivate client:", error);
    }
  };

  return (
    <div>
      {/* Status Message */}
      {statusMessage && (
        <div className={`mb-4 rounded-md px-4 py-2 text-sm ${statusMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {statusMessage.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <Link
          href="/clients"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {client.name || client.email}
            </h1>
            <p className="text-muted-foreground">{client.email}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/clients/${clientUid}/program`}
              className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Edit className="h-4 w-4" />
              {client.has_program ? "Edit Program" : "Create Program"}
            </Link>
            <button
              onClick={() => setShowResetPassword(true)}
              className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Key className="h-4 w-4" />
              Reset Password
            </button>
            <button
              onClick={() => setShowDeactivate(true)}
              className="flex items-center gap-2 rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Deactivate
            </button>
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Client Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-muted-foreground">Client ID</dt>
              <dd className="text-sm font-medium">
                {client.bnn_client_id || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Age</dt>
              <dd className="text-sm font-medium">{client.age || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Substance Type</dt>
              <dd className="text-sm font-medium">
                {client.substance_type || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Daily Frequency</dt>
              <dd className="text-sm font-medium">
                {client.daily_frequency || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Daily Cost</dt>
              <dd className="text-sm font-medium">
                {client.daily_cost ? formatCurrency(client.daily_cost) : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">
                Monthly Spending
              </dt>
              <dd className="text-sm font-medium">
                {client.monthly_spending
                  ? formatCurrency(client.monthly_spending)
                  : "-"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Program Status</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd>
                <span className="inline-flex rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500">
                  {client.bnn_status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Has Program</dt>
              <dd className="text-sm font-medium">
                {client.has_program ? "Yes" : "No"}
              </dd>
            </div>
            {client.program_estimates && (
              <>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Partial Recovery
                  </dt>
                  <dd className="text-sm font-medium">
                    {client.program_estimates.partial_recovery_days} days
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Full Recovery
                  </dt>
                  <dd className="text-sm font-medium">
                    {client.program_estimates.full_recovery_days} days
                  </dd>
                </div>
              </>
            )}
            <div>
              <dt className="text-sm text-muted-foreground">Assigned Admin</dt>
              <dd className="text-sm font-medium">
                {client.bnn_assigned_admin || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Created</dt>
              <dd className="text-sm font-medium">
                {formatDate(client.created_at)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Current Streak
          </div>
          <p className="mt-1 text-2xl font-bold">
            {client.stats.current_streak}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Longest Streak
          </div>
          <p className="mt-1 text-2xl font-bold">
            {client.stats.longest_streak}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Quests Completed
          </div>
          <p className="mt-1 text-2xl font-bold">
            {client.stats.total_quests_completed}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Progress
          </div>
          <p className="mt-1 text-2xl font-bold">
            {client.stats.program_progress_pct}%
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Relapses
          </div>
          <p className="mt-1 text-2xl font-bold">
            {client.stats.relapse_count}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Last Active
          </div>
          <p className="mt-1 text-sm font-medium">
            {client.stats.last_active_date || "Never"}
          </p>
        </div>
      </div>

      {/* Triggers & Distractions */}
      <div className="grid gap-6 md:grid-cols-2">
        {client.triggers && client.triggers.length > 0 && (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold">Triggers</h3>
            <div className="flex flex-wrap gap-2">
              {client.triggers.map((trigger) => (
                <span
                  key={trigger}
                  className="rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-500"
                >
                  {trigger}
                </span>
              ))}
            </div>
          </div>
        )}

        {client.distractions && client.distractions.length > 0 && (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold">Distractions</h3>
            <div className="flex flex-wrap gap-2">
              {client.distractions.map((distraction) => (
                <span
                  key={distraction}
                  className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-500"
                >
                  {distraction}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Reset Password</h2>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Min 8 characters"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetPassword(false)}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetPassword.isPending || newPassword.length < 8}
                className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-2 text-xl font-bold">Deactivate Client</h2>
            <p className="mb-4 text-muted-foreground">
              Are you sure you want to deactivate this client? This will disable
              their account and they will no longer be able to access the app.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeactivate(false)}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={deactivateClient.isPending}
                className="flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-50"
              >
                {deactivateClient.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
