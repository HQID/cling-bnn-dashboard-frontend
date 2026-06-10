"use client";

import { useDashboardOverview } from "@/hooks/use-api";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  const { data: overview, isLoading } = useDashboardOverview();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!overview) {
    return <div>Failed to load dashboard data</div>;
  }

  const stats = [
    {
      name: "Total Clients",
      value: overview.total_clients,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      name: "Active Clients",
      value: overview.active_clients,
      icon: UserCheck,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      name: "Inactive Clients",
      value: overview.inactive_clients,
      icon: UserX,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of BNN rehabilitation program
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`rounded-full ${stat.bgColor} p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Phase Distribution */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5" />
            Phase Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(overview.phase_distribution).map(
              ([phase, count]) => (
                <div key={phase} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-muted-foreground">
                    Phase {phase}
                  </span>
                  <div className="flex-1">
                    <div className="h-4 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${
                            (count / overview.total_clients) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-right text-sm font-medium">
                    {count}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Streak Distribution */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Activity className="h-5 w-5" />
            Streak Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(overview.streak_distribution).map(
              ([bucket, count]) => (
                <div key={bucket} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-muted-foreground">
                    {bucket.replace("_", " ")}
                  </span>
                  <div className="flex-1">
                    <div className="h-4 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{
                          width: `${
                            (count / overview.total_clients) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-right text-sm font-medium">
                    {count}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Streak</th>
                <th className="pb-3 font-medium">Level</th>
                <th className="pb-3 font-medium">Sessions</th>
              </tr>
            </thead>
            <tbody>
              {overview.recent_activity.map((client) => (
                <tr key={client.uid} className="border-b last:border-0">
                  <td className="py-3 text-sm">{client.email}</td>
                  <td className="py-3 text-sm">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                      {client.streak} days
                    </span>
                  </td>
                  <td className="py-3 text-sm">Level {client.level}</td>
                  <td className="py-3 text-sm">{client.total_sessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
