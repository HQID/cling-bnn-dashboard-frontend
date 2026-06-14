import axios from "axios";
import { auth } from "./firebase";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      auth.signOut();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── API Types ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
  error?: string;
}

export interface BnnAdmin {
  uid: string;
  email: string;
  name: string;
  role: "bnn_admin" | "bnn_super_admin";
  is_active: boolean;
  created_at: string;
  created_by: string;
}

export interface BnnClient {
  uid: string;
  email: string;
  name?: string;
  category_id: string;
  age: number | null;
  substance_type: string | null;
  daily_frequency: number | null;
  daily_cost: number | null;
  monthly_spending: number | null;
  triggers: string[] | null;
  distractions: string[] | null;
  bnn_status: string;
  bnn_client_id: string | null;
  bnn_assigned_admin: string | null;
  bnn_program_assigned_at: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
  clings_stats: {
    total_sessions: number;
    streak_days: number;
    triggers_identified: number;
    longest_streak: number;
  };
  xp: number;
  level: number;
}

export interface BnnClientDetail extends BnnClient {
  stats: {
    total_quests_completed: number;
    current_streak: number;
    longest_streak: number;
    program_progress_pct: number;
    relapse_count: number;
    last_active_date: string | null;
  };
  has_program: boolean;
  program_estimates: {
    partial_recovery_days: number;
    full_recovery_days: number;
  } | null;
}

export interface RecoveryPhase {
  phase_index: number;
  title: string;
  duration_days: number;
  expected_symptoms: string[];
  mitigation_tasks: string[];
}

export interface EvidenceRequirement {
  allowed_types: ("image" | "pdf" | "video" | "document")[];
  max_files: number;
}

export interface EvidenceUpload {
  id: string;
  quest_id: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  xp_reward: number;
  sparkle_reward: number;
  science_source?: string;
  quest_type?: "daily" | "phase" | "emergency" | "critical";
  evidence_requirement?: EvidenceRequirement | null;
}

export interface CriticalDay {
  day_offset: number;
  date: string;
  description?: string;
  fixed_task_ids: string[];
}

export interface GameConfig {
  game_id: string;
  game_type: "breathing" | "grounding" | "distraction" | "physical";
  title: string;
  description: string;
  duration_seconds: number;
  recommended_phase: number;
  ui: Record<string, unknown>;
}

export interface RecoveryProgram {
  phases: RecoveryPhase[];
  task_pools: Record<string, Task[]>;
  critical_days: CriticalDay[];
  games: GameConfig[];
  estimates: {
    partial_recovery_days: number;
    full_recovery_days: number;
  };
  generated_at: string;
}

export interface DashboardOverview {
  total_clients: number;
  active_clients: number;
  inactive_clients: number;
  phase_distribution: Record<number, number>;
  streak_distribution: {
    "0_days": number;
    "1-7_days": number;
    "8-30_days": number;
    "31+_days": number;
  };
  recent_activity: Array<{
    uid: string;
    email: string;
    streak: number;
    level: number;
    total_sessions: number;
  }>;
}

export interface QuestHistory {
  uid: string;
  date_range: { start: string; end: string };
  total_quests: number;
  total_completed: number;
  daily_stats: Array<{
    date: string;
    total: number;
    completed: number;
    completion_rate: number;
  }>;
  quests: Array<{
    id: string;
    title: string;
    description: string;
    quest_type: string;
    is_completed: boolean;
    completed_at: string | null;
    xp_reward: number;
    sparkle_reward: number;
    date: string;
  }>;
}

export interface RelapseLog {
  id: string;
  trigger_id: string | null;
  mood_before: string;
  notes: string;
  intensity: "low" | "medium" | "high";
  created_at: string;
}

export interface CompletedQuestWithEvidence {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  xp_reward: number;
  sparkle_reward: number;
  completed_at: string | null;
  date: string;
  evidence_requirement: EvidenceRequirement | null;
  evidence: EvidenceUpload[];
}

export interface CompletedQuestsResponse {
  uid: string;
  date_range: { start: string; end: string };
  total_completed_with_evidence: number;
  quests_by_date: Record<string, CompletedQuestWithEvidence[]>;
  quests: CompletedQuestWithEvidence[];
}

export interface EmergencyLog {
  id: string;
  event_type: string;
  duration_seconds: number;
  mood_before: string;
  mood_after: string;
  notes: string;
  created_at: string;
}
