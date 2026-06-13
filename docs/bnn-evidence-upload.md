# BNN Quest Evidence Upload — Dashboard Changes

**Date:** 2026-06-13
**Status:** Implemented
**Scope:** bnn-dashboard

---

## Overview

BNN admins can now configure evidence requirements per task when building recovery programs. When a task has evidence enabled, BNN clients must upload a file (matching the configured type) before they can complete the quest.

## Changes Made

### 1. Type Definitions (`src/lib/api.ts`)

Added new interfaces:

```typescript
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
```

Updated `Task` interface:
```typescript
export interface Task {
  // ... existing fields ...
  evidence_requirement?: EvidenceRequirement | null;
}
```

### 2. API Hooks (`src/hooks/use-api.ts`)

Added new hook for viewing uploaded evidence:

```typescript
export function useQuestEvidence(clientUid: string, questId: string)
```

- Fetches evidence uploads for a specific client quest
- Used by admin to review submitted evidence

### 3. Program Builder UI (`src/app/(dashboard)/clients/[uid]/program/page.tsx`)

Added evidence configuration UI per task card:

**Toggle:** "Bukti yang Dibutuhkan" (Evidence Required)
- Default: OFF (evidence_requirement: null)
- When ON: shows file type selection and max files stepper

**File Type Selection:** Multi-select toggle buttons
- 📷 Gambar (Image) — `image`
- 📄 PDF — `pdf`
- 🎥 Video — `video`
- 📝 Dokumen (Document) — `document`
- At least one type must be selected

**Max Files:** NumberStepper (1-5, default 1)

## Data Flow

1. Admin creates task → toggles "Bukti yang Dibutuhkan" ON
2. Admin selects allowed file types (e.g., Image + PDF)
3. Admin sets max files (e.g., 2)
4. Admin saves program → `evidence_requirement` stored in task_pool
5. When quests are generated for the client, each quest carries `evidence_requirement`
6. Client sees evidence requirement on their mobile app
7. Client uploads file → backend validates type against `allowed_types`
8. Client completes quest with `evidence_id` → backend validates evidence exists

## Verification

1. Open Program Builder for a BNN client
2. Add a new task
3. Toggle "Bukti yang Dibutuhkan" ON
4. Verify file type buttons appear
5. Select "Gambar" and "PDF"
6. Set max files to 2
7. Save program
8. Reload page → verify evidence config persists
9. Check API response: task should include `evidence_requirement: { allowed_types: ["image", "pdf"], max_files: 2 }`
