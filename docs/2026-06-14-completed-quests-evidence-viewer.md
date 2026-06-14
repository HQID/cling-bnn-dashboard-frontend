# Completed Quests Evidence Viewer -- 2026-06-13

## Summary

Added a "Riwayat Quest dengan Bukti" (Quest History with Evidence) section to the client detail page. BNN admins can now view completed quests and their uploaded evidence files directly from the dashboard.

**Before:** Admins could see client stats and quest history but had no way to view uploaded evidence or see which quests had evidence attached.

**After:** Client detail page shows completed quests grouped by date, with evidence files displayed as clickable chips. Clicking opens the file in a new tab via a fresh signed URL.

---

## Root Cause

The existing `useClientQuests` hook returned quest history but:
1. No evidence data was included in the response
2. No UI existed to display evidence files
3. No endpoint existed for completed quests with evidence

---

## Changes

### 1. Type Definitions (`src/lib/api.ts`)

Added `CompletedQuestWithEvidence` and `CompletedQuestsResponse` interfaces:

```typescript
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
```

### 2. API Hook (`src/hooks/use-api.ts`)

Added `useClientCompletedQuests` hook:

```typescript
export function useClientCompletedQuests(
  clientUid: string,
  startDate?: string,
  endDate?: string
)
```

Calls `GET /bnn/analytics/clients/:clientUid/completed-quests` with optional date range params.

### 3. Client Detail Page (`src/app/(dashboard)/clients/[uid]/page.tsx`)

Added "Riwayat Quest dengan Bukti" section after Triggers & Distractions:

- Only renders when `total_completed_with_evidence > 0`
- Quests grouped by date, sorted newest first
- Each quest card shows:
  - Checkmark icon + quest title
  - Quest type badge (daily/phase/emergency/critical)
  - XP reward
  - Description (if any)
  - Evidence files as clickable chips with type-specific icons:
    - 📷 `ImageIcon` (blue) for images
    - 🎥 `Video` (purple) for videos
    - 📄 `FileText` (red) for PDFs
    - 📝 `File` (grey) for documents
  - External link icon on each evidence chip
- Clicking evidence chip opens signed URL in new tab

---

## Files Modified

| File | Change |
|------|--------|
| `src/lib/api.ts` | Added `CompletedQuestWithEvidence`, `CompletedQuestsResponse` types |
| `src/hooks/use-api.ts` | Added `useClientCompletedQuests` hook |
| `src/app/(dashboard)/clients/[uid]/page.tsx` | Added quest history section with evidence viewer |

---

## UI Layout

```
┌─────────────────────────────────────────────┐
│ Riwayat Quest dengan Bukti                   │
├─────────────────────────────────────────────┤
│ 📅 13 Juni 2026 (3 quest)                   │
│ ┌─────────────────────────────────────────┐ │
│ │ ✅ Attend NA Meeting        [daily] +50 │ │
│ │ Go to a Narcotics Anonymous meeting     │ │
│ │ [📷 photo.jpg] [📄 report.pdf]          │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ ✅ Exercise 30 Minutes      [daily] +30 │ │
│ │ [🎥 workout.mp4]                        │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ 📅 12 Juni 2026 (2 quest)                   │
│ ┌─────────────────────────────────────────┐ │
│ │ ✅ Journal Entry            [phase] +40 │ │
│ │ [📝 journal.docx]                       │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Verification

1. Open client detail page for a BNN client with completed evidence quests
2. "Riwayat Quest dengan Bukti" section appears
3. Quests grouped by date, newest first
4. Evidence chips show correct icons per file type
5. Clicking evidence chip → file opens in new tab (signed URL works)
6. Section does not appear for clients with no completed evidence quests
