"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
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
import { NumberStepper } from "@/components/number-stepper";
import { SelectionCard } from "@/components/selection-card";

const questTypeOptions = [
  { value: "daily", label: "Harian", description: "Tugas harian berulang" },
  { value: "phase", label: "Fase", description: "Tugas khusus fase ini" },
  { value: "emergency", label: "Darurat", description: "Tugas saat krisis" },
  { value: "critical", label: "Kritis", description: "Tugas hari kritis" },
];

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
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Load existing program data
  useEffect(() => {
    if (existingProgram) {
      setPhases(existingProgram.phases);
      setTaskPools(existingProgram.task_pools);
      setCriticalDays(existingProgram.critical_days);
      setGames(existingProgram.games);
      setEstimates(existingProgram.estimates);
    }
  }, [existingProgram]);

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
    const reindexed = newPhases.map((p, i) => ({ ...p, phase_index: i + 1 }));
    setPhases(reindexed);

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
    setSaveStatus(null);
    try {
      await createProgram.mutateAsync({
        phases,
        task_pools: taskPools,
        critical_days: criticalDays,
        games,
        estimates,
      });
      setSaveStatus({
        type: "success",
        message: "Program berhasil disimpan!",
      });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({
        type: "error",
        message: "Gagal menyimpan program. Silakan coba lagi.",
      });
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-grey200 border-t-text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/clients/${clientUid}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Klien
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Pembuat Program
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {client?.name || client?.email}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={createProgram.isPending}
            className="flex h-10 items-center gap-2 rounded-[14px] bg-text-primary px-5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {createProgram.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Simpan Program
          </button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <div
          className={`mb-4 rounded-[14px] px-4 py-3 text-sm ${
            saveStatus.type === "success"
              ? "bg-grey50 text-success"
              : "bg-error-light text-error"
          }`}
        >
          {saveStatus.message}
        </div>
      )}

      {/* Estimates */}
      <div className="mb-4 rounded-[20px] bg-grey50 p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Estimasi Pemulihan
        </h3>
        <div className="grid gap-3.5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">
              Pemulihan Parsial (hari)
            </label>
            <NumberStepper
              value={estimates.partial_recovery_days}
              onChange={(v) =>
                setEstimates({ ...estimates, partial_recovery_days: v })
              }
              min={30}
              max={365}
              step={10}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-text-primary">
              Pemulihan Penuh (hari)
            </label>
            <NumberStepper
              value={estimates.full_recovery_days}
              onChange={(v) =>
                setEstimates({ ...estimates, full_recovery_days: v })
              }
              min={60}
              max={730}
              step={10}
            />
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="mb-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Fase</h3>
          <button
            onClick={addPhase}
            className="flex h-10 items-center gap-1.5 rounded-[14px] border border-grey200 px-3.5 text-sm font-semibold text-text-primary transition-all hover:bg-grey50"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Fase
          </button>
        </div>

        <div className="space-y-3">
          {phases.map((phase, index) => (
            <div
              key={phase.phase_index}
              className="rounded-[16px] bg-grey50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-text-tertiary" />
                  <span className="text-sm font-semibold text-text-primary">
                    Fase {phase.phase_index}
                  </span>
                </div>
                <button
                  onClick={() => removePhase(index)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-error transition-colors hover:bg-error-light"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                    Judul
                  </label>
                  <input
                    type="text"
                    value={phase.title}
                    onChange={(e) =>
                      updatePhase(index, { title: e.target.value })
                    }
                    className="w-full rounded-[14px] border border-transparent bg-off-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary"
                    placeholder="cth: Fase Penarikan Akut"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                    Durasi (hari)
                  </label>
                  <NumberStepper
                    value={phase.duration_days}
                    onChange={(v) => updatePhase(index, { duration_days: v })}
                    min={7}
                    max={365}
                    step={7}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Tasks for this phase */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-secondary">
                    Tugas ({(taskPools[String(phase.phase_index)] ?? []).length})
                  </span>
                  <button
                    onClick={() => addTask(phase.phase_index)}
                    className="flex items-center gap-1 text-xs font-semibold text-text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    Tambah Tugas
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(taskPools[String(phase.phase_index)] ?? []).map((task) => (
                    <div
                      key={task.id}
                      className="rounded-[12px] bg-off-white p-3.5"
                    >
                      <div className="mb-2.5 flex items-center gap-2">
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) =>
                            updateTask(phase.phase_index, task.id, {
                              title: e.target.value,
                            })
                          }
                          className="flex-1 rounded-[12px] border border-transparent bg-background px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary"
                          placeholder="Judul tugas"
                        />
                        <button
                          onClick={() =>
                            removeTask(phase.phase_index, task.id)
                          }
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-error transition-colors hover:bg-error-light"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Quest Type Selection */}
                      <div className="mb-2.5">
                        <label className="mb-1.5 block text-[11px] font-semibold text-text-tertiary">
                          Tipe Quest
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {questTypeOptions.map((opt) => {
                            const isSelected = task.quest_type === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() =>
                                  updateTask(phase.phase_index, task.id, {
                                    quest_type: opt.value as Task["quest_type"],
                                  })
                                }
                                className={`flex items-center gap-2 rounded-[10px] border px-3 py-2.5 text-left transition-all duration-200 ${
                                  isSelected
                                    ? "border-text-primary bg-text-primary text-white"
                                    : "border-grey200 bg-grey50 text-text-primary"
                                }`}
                              >
                                <div
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all duration-200 ${
                                    isSelected
                                      ? "border-white bg-white"
                                      : "border-grey300 bg-transparent"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="h-2 w-2 rounded-full bg-text-primary" />
                                  )}
                                </div>
                                <span className="text-xs font-medium">
                                  {opt.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* XP Reward Stepper */}
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold text-text-tertiary">
                          Hadiah XP
                        </label>
                        <NumberStepper
                          value={task.xp_reward}
                          onChange={(v) =>
                            updateTask(phase.phase_index, task.id, {
                              xp_reward: v,
                            })
                          }
                          min={0}
                          max={500}
                          step={10}
                          className="h-10"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {phases.length === 0 && (
          <div className="rounded-[16px] border border-dashed border-grey200 py-12 text-center text-sm text-text-tertiary">
            Belum ada fase. Klik &quot;Tambah Fase&quot; untuk memulai.
          </div>
        )}
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={createProgram.isPending}
          className="flex h-10 items-center gap-2 rounded-[14px] bg-text-primary px-6 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
        >
          {createProgram.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Simpan Program
        </button>
      </div>
    </div>
  );
}
