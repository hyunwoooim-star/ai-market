// ── Client-safe constants from marketplace.ts ──────────────
// Use this in 'use client' components. No server-only imports.

export const CATEGORIES = [
  'translation', 'code-review', 'content-writing', 'research',
  'summarization', 'seo', 'data-analysis', 'design', 'marketing',
  'email-drafting', 'proofreading', 'other',
] as const;

export type TaskCategory = typeof CATEGORIES[number];

export const TASK_STATUSES = [
  'open', 'assigned', 'submitted', 'completed', 'cancelled',
] as const;

export type TaskStatus = typeof TASK_STATUSES[number];
