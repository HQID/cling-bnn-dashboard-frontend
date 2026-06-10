import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, {
  type ApiResponse,
  type BnnAdmin,
  type BnnClient,
  type BnnClientDetail,
  type DashboardOverview,
  type RecoveryProgram,
  type QuestHistory,
  type RelapseLog,
  type EmergencyLog,
} from "@/lib/api";

// ─── Dashboard ──────────────────────────────────────────────────────────────

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardOverview>>(
        "/bnn/analytics/dashboard/overview"
      );
      return data.data;
    },
  });
}

// ─── Clients ────────────────────────────────────────────────────────────────

export function useClients(search?: string) {
  return useQuery({
    queryKey: ["clients", search],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BnnClient[]>>(
        "/bnn/clients/list",
        { params: { search } }
      );
      return data;
    },
  });
}

export function useClient(uid: string) {
  return useQuery({
    queryKey: ["clients", uid],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BnnClientDetail>>(
        `/bnn/clients/${uid}`
      );
      return data.data;
    },
    enabled: !!uid,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientData: {
      email: string;
      password: string;
      name: string;
      client_identifier: string;
      age?: number;
      substance_type?: string;
      daily_frequency?: number;
      daily_cost?: number;
      monthly_spending?: number;
      triggers?: string[];
      distractions?: string[];
    }) => {
      const { data } = await api.post<ApiResponse<{ uid: string }>>(
        "/bnn/clients/create",
        clientData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient(uid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      name?: string;
      client_identifier?: string;
      age?: number;
      substance_type?: string;
      daily_frequency?: number;
      daily_cost?: number;
      monthly_spending?: number;
      triggers?: string[];
      distractions?: string[];
    }) => {
      const { data } = await api.patch<ApiResponse<{ uid: string }>>(
        `/bnn/clients/${uid}`,
        updates
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", uid] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useDeactivateClient(uid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<ApiResponse<{ uid: string }>>(
        `/bnn/clients/${uid}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useResetClientPassword(uid: string) {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const { data } = await api.post<ApiResponse<{ uid: string }>>(
        `/bnn/clients/${uid}/reset-password`,
        { new_password: newPassword }
      );
      return data;
    },
  });
}

// ─── Programs ───────────────────────────────────────────────────────────────

export function useProgram(clientUid: string) {
  return useQuery({
    queryKey: ["programs", clientUid],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RecoveryProgram>>(
        `/bnn/programs/clients/${clientUid}/program`
      );
      return data.data;
    },
    enabled: !!clientUid,
  });
}

export function useCreateProgram(clientUid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (program: Omit<RecoveryProgram, "generated_at">) => {
      const { data } = await api.post<ApiResponse<{ client_uid: string }>>(
        `/bnn/programs/clients/${clientUid}/program`,
        program
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs", clientUid] });
      queryClient.invalidateQueries({ queryKey: ["clients", clientUid] });
    },
  });
}

export function useUpdatePhase(clientUid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      phaseIndex,
      phase,
    }: {
      phaseIndex: number;
      phase: {
        phase_index: number;
        title: string;
        duration_days: number;
        expected_symptoms: string[];
        mitigation_tasks: string[];
      };
    }) => {
      const { data } = await api.patch(
        `/bnn/programs/clients/${clientUid}/program/phases/${phaseIndex}`,
        phase
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs", clientUid] });
    },
  });
}

export function useAddTasks(clientUid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      phaseIndex,
      tasks,
    }: {
      phaseIndex: number;
      tasks: Array<{
        id: string;
        title: string;
        description?: string;
        xp_reward: number;
        sparkle_reward: number;
        science_source?: string;
        quest_type: string;
      }>;
    }) => {
      const { data } = await api.post(
        `/bnn/programs/clients/${clientUid}/program/task-pools/${phaseIndex}`,
        { tasks }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs", clientUid] });
    },
  });
}

export function useRemoveTask(clientUid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      phaseIndex,
      taskId,
    }: {
      phaseIndex: number;
      taskId: string;
    }) => {
      const { data } = await api.delete(
        `/bnn/programs/clients/${clientUid}/program/task-pools/${phaseIndex}/${taskId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs", clientUid] });
    },
  });
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export function useClientQuests(
  clientUid: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ["analytics", clientUid, "quests", startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<QuestHistory>>(
        `/bnn/analytics/clients/${clientUid}/quests`,
        { params: { start_date: startDate, end_date: endDate } }
      );
      return data.data;
    },
    enabled: !!clientUid,
  });
}

export function useClientRelapseLogs(
  clientUid: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ["analytics", clientUid, "relapse-logs", startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{
          uid: string;
          date_range: { start: string; end: string };
          total_relapses: number;
          logs: RelapseLog[];
        }>
      >(`/bnn/analytics/clients/${clientUid}/relapse-logs`, {
        params: { start_date: startDate, end_date: endDate },
      });
      return data.data;
    },
    enabled: !!clientUid,
  });
}

export function useClientEmergencyLogs(
  clientUid: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ["analytics", clientUid, "emergency-logs", startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{
          uid: string;
          date_range: { start: string; end: string };
          total_events: number;
          logs: EmergencyLog[];
        }>
      >(`/bnn/analytics/clients/${clientUid}/emergency-logs`, {
        params: { start_date: startDate, end_date: endDate },
      });
      return data.data;
    },
    enabled: !!clientUid,
  });
}

// ─── Admin ──────────────────────────────────────────────────────────────────

export function useAdminProfile() {
  return useQuery({
    queryKey: ["admin", "me"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BnnAdmin>>("/bnn/admin/me");
      return data.data;
    },
  });
}

export function useAdmins() {
  return useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BnnAdmin[]>>(
        "/bnn/admin/list"
      );
      return data.data;
    },
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminData: {
      email: string;
      password: string;
      name: string;
    }) => {
      const { data } = await api.post<ApiResponse<{ uid: string }>>(
        "/bnn/admin/create-admin",
        adminData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

export function useFirstTimeSetup() {
  return useMutation({
    mutationFn: async (setupData: {
      email: string;
      password: string;
      name: string;
      setup_secret: string;
    }) => {
      const { data } = await api.post<ApiResponse<{ uid: string }>>(
        "/bnn/admin/setup-first-admin",
        setupData
      );
      return data;
    },
  });
}
