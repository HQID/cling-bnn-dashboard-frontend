"use client";

import { useDashboardOverview } from "@/hooks/use-api";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Activity,
  Flame,
} from "lucide-react";

export default function DashboardPage() {
  const { data: overview, isLoading } = useDashboardOverview();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-grey200 border-t-text-primary" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-text-secondary">
          Gagal memuat data dashboard
        </p>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Klien",
      value: overview.total_clients,
      icon: Users,
    },
    {
      name: "Klien Aktif",
      value: overview.active_clients,
      icon: UserCheck,
    },
    {
      name: "Klien Tidak Aktif",
      value: overview.inactive_clients,
      icon: UserX,
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Ringkasan program rehabilitasi BNN
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-[20px] bg-grey50 p-5"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[12px] bg-grey100">
              <stat.icon className="h-[18px] w-[18px] text-grey600" />
            </div>
            <p className="text-[32px] font-bold tracking-tight text-text-primary">
              {stat.value}
            </p>
            <p className="mt-0.5 text-sm font-normal text-text-secondary">
              {stat.name}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="mb-6 grid gap-3 md:grid-cols-2">
        {/* Phase Distribution */}
        <div className="rounded-[20px] bg-grey50 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-primary">
            <TrendingUp className="h-4 w-4" />
            Distribusi Fase
          </h3>
          <div className="space-y-3">
            {Object.entries(overview.phase_distribution).map(
              ([phase, count]) => (
                <div key={phase} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-text-secondary">
                    Fase {phase}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-grey100">
                      <div
                        className="h-full rounded-full bg-text-primary transition-all"
                        style={{
                          width: `${
                            (count / overview.total_clients) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-6 text-right text-xs font-semibold text-text-primary">
                    {count}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Streak Distribution */}
        <div className="rounded-[20px] bg-grey50 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Activity className="h-4 w-4" />
            Distribusi Streak
          </h3>
          <div className="space-y-3">
            {Object.entries(overview.streak_distribution).map(
              ([bucket, count]) => (
                <div key={bucket} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-text-secondary">
                    {bucket.replace("_", " ")}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-grey100">
                      <div
                        className="h-full rounded-full bg-text-primary transition-all"
                        style={{
                          width: `${
                            (count / overview.total_clients) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-6 text-right text-xs font-semibold text-text-primary">
                    {count}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-[20px] bg-grey50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Aktivitas Terbaru
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey100">
                <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Email
                </th>
                <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Streak
                </th>
                <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Level
                </th>
                <th className="pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Sesi
                </th>
              </tr>
            </thead>
            <tbody>
              {overview.recent_activity.map((client) => (
                <tr
                  key={client.uid}
                  className="border-b border-grey100 last:border-0"
                >
                  <td className="py-3 text-sm text-text-primary">
                    {client.email}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-text-primary">
                      <Flame className="h-3.5 w-3.5 text-vibrant-orange" />
                      {client.streak} hari
                    </span>
                  </td>
                  <td className="py-3 text-sm text-text-secondary">
                    Level {client.level}
                  </td>
                  <td className="py-3 text-sm text-text-secondary">
                    {client.total_sessions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
