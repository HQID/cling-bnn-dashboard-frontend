"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useProgram, useCreateProgram, useClient } from "@/hooks/use-api";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  GripVertical,
} from "lucide-react";
import type { RecoveryPhase, Task, CriticalDay, GameConfig } from "@/lib/api";

export default function ProgramBuilderPage() {
  const params = useParams();
  const clientUid = params["uid"] as string;
  const { data: client } = useClient(clientUid);
  const { data: existingProgram, isLoading } = useProgram(clientUid);
  const createProgram = useCreateProgram(clientUid);

  // Program state
  const [phases, setPhases] = useState<RecoveryPhase[]>([]);
  const [taskPools, setTaskPools] = useState<Record<string, Task[]>>({});
  const [criticalDays, setCriticalDays] = useState<CriticalDay[]>([]);
  const [games, setGames] = useState<GameConfig[]>([]);
  const [estimates, setEstimates] = useState({
    partial_recovery_days: 90,
    full_recovery_days: 180,
  });

  // Load existing program data
  useState(() => {
    if (existingProgram) {
      setPhases(existingProgram.phases);
      setTaskPools(existingProgram.task_pools);
      setCriticalDays(existingProgram.critical_days);
      setGames(existingProgram.games);
      setEstimates(existingProgram.estimates);
    }
  });

  // Add new phase
  const addPhase = () => {
    const newPhase: RecoveryPhase = {
      phase_index: phases.length + 1,
      title: "",
      duration_days: 30,
      expected_symptoms: [],
      mitigation_tasks: [],
    };
    setPhases([...phases, newPhase]);
    setTaskPools({ ...taskPools, [String(newPhase.phase_index)]: [] });
  };

  // Remove phase
  const removePhase = (index: number) => {
    const newPhases = phases.filter((_, i) => i !== index);
    // Reindex phases
    const reindexed = newPhases.map((p, i) => ({ ...p, phase_index: i + 1 }));
    setPhases(reindexed);

    // Update task pools
    const newPools: Record<string, Task[]> = {};
    reindexed.forEach((p, i) => {
      const oldKey = String(phases[i]?.phase_index);
      newPools[String(p.phase_index)] = oldKey
        ? (taskPools[oldKey] ?? [])
        : [];
    });
    setTaskPools(newPools);
  };

  // Update phase
  const updatePhase = (index: number, updates: Partial<RecoveryPhase>) => {
    const newPhases = [...phases];
    newPhases[index] = { ...newPhases[index]!, ...updates };
    setPhases(newPhases);
  };

  // Add task to phase
  const addTask = (phaseIndex: number) => {
    const key = String(phaseIndex);
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: "",
      xp_reward: 50,
      sparkle_reward: 10,
      quest_type: "daily",
    };
    setTaskPools({
      ...taskPools,
      [key]: [...(taskPools[key] ?? []), newTask],
    });
  };

  // Remove task
  const removeTask = (phaseIndex: number, taskId: string) => {
    const key = String(phaseIndex);
    setTaskPools({
      ...taskPools,
      [key]: (taskPools[key] ?? []).filter((t) => t.id !== taskId),
    });
  };

  // Update task
  const updateTask = (
    phaseIndex: number,
    taskId: string,
    updates: Partial<Task>
  ) => {
    const key = String(phaseIndex);
    setTaskPools({
      ...taskPools,
      [key]: (taskPools[key] ?? []).map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    });
  };

  // Save program
  const handleSave = async () => {
    try {
      await createProgram.mutateAsync({
        phases,
        task_pools: taskPools,
        critical_days: criticalDays,
        games,
        estimates,
      });
      alert("Program saved successfully!");
    } catch (error) {
      console.error("Failed to save program:", error);
      alert("Failed to save program");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/clients/${clientUid}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Client
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Program Builder</h1>
            <p className="text-muted-foreground">
              {client?.name || client?.email}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={createProgram.isPending}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {createProgram.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Program
          </button>
        </div>
      </div>

      {/* Estimates */}
      <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Recovery Estimates</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Partial Recovery (days)
            </label>
            <input
              type="number"
              value={estimates.partial_recovery_days}
              onChange={(e) =>
                setEstimates({
                  ...estimates,
                  partial_recovery_days: parseInt(e.target.value) || 0,
                })
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Full Recovery (days)
            </label>
            <input
              type="number"
              value={estimates.full_recovery_days}
              onChange={(e) =>
                setEstimates({
                  ...estimates,
                  full_recovery_days: parseInt(e.target.value) || 0,
                })
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Phases</h3>
          <button
            onClick={addPhase}
            className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
            Add Phase
          </button>
        </div>

        <div className="space-y-4">
          {phases.map((phase, index) => (
            <div
              key={phase.phase_index}
              className="rounded-lg border bg-card p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    Phase {phase.phase_index}
                  </span>
                </div>
                <button
                  onClick={() => removePhase(index)}
                  className="rounded p-1 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm">Title</label>
                  <input
                    type="text"
                    value={phase.title}
                    onChange={(e) =>
                      updatePhase(index, { title: e.target.value })
                    }
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                    placeholder="e.g., Acute Withdrawal Phase"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm">
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    value={phase.duration_days}
                    onChange={(e) =>
                      updatePhase(index, {
                        duration_days: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                  />
                </div>
              </div>

              {/* Tasks for this phase */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Tasks ({(taskPools[String(phase.phase_index)] ?? []).length})
                  </span>
                  <button
                    onClick={() => addTask(phase.phase_index)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    Add Task
                  </button>
                </div>

                <div className="space-y-2">
                  {(taskPools[String(phase.phase_index)] ?? []).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 rounded border bg-muted/50 p-2"
                    >
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) =>
                          updateTask(phase.phase_index, task.id, {
                            title: e.target.value,
                          })
                        }
                        className="flex-1 rounded border bg-background px-2 py-1 text-sm"
                        placeholder="Task title"
                      />
                      <input
                        type="number"
                        value={task.xp_reward}
                        onChange={(e) =>
                          updateTask(phase.phase_index, task.id, {
                            xp_reward: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-20 rounded border bg-background px-2 py-1 text-sm"
                        placeholder="XP"
                      />
                      <button
                        onClick={() =>
                          removeTask(phase.phase_index, task.id)
                        }
                        className="rounded p-1 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {phases.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No phases added yet. Click &quot;Add Phase&quot; to get started.
          </div>
        )}
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={createProgram.isPending}
          className="flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {createProgram.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Program
        </button>
      </div>
    </div>
  );
}
