/**
 * Data-access layer — all Supabase calls go through here.
 * All functions return local-format objects (camelCase) and throw on error.
 *
 * Supabase table column names (snake_case):
 *   events: id, title, description, date, time, location, image_url,
 *           form_link, has_certificate, certificate_template,
 *           name_x, name_y, name_font_size, name_color, created_at
 *   achievements: id, icon, title, description, image_url, created_at
 *   tasks: id, name, event, committee, deadline, status, notes, created_at
 *   certificate_participants: id, event_id, name, phone, created_at
 */
import { supabase } from './supabase';

/* ══ Mappers ═══════════════════════════════════════════════════ */

export const toLocalEvent = (r) => ({
  id:                  r.id,
  title:               r.title               || '',
  description:         r.description         || '',
  date:                r.date                || '',
  time:                r.time                || '',
  location:            r.location            || '',
  image:               r.image_url           || null,
  formLink:            r.form_link           || '',
  hasCertificate:      r.has_certificate     ?? false,
  certificateTemplate: r.certificate_template || null,
  nameX:               r.name_x              ?? 50,
  nameY:               r.name_y              ?? 55,
  nameFontSize:        r.name_font_size      ?? 52,
  nameColor:           r.name_color          || '#ffffff',
});

export const toSupabaseEvent = (e) => ({
  id:                   e.id,
  title:                e.title,
  description:          e.description,
  date:                 e.date,
  time:                 e.time || null,
  location:             e.location,
  image_url:            e.image || null,
  form_link:            e.formLink || null,
  has_certificate:      e.hasCertificate,
  certificate_template: e.certificateTemplate || null,
  name_x:               Number(e.nameX)        || 50,
  name_y:               Number(e.nameY)        || 55,
  name_font_size:       Number(e.nameFontSize) || 52,
  name_color:           e.nameColor            || '#ffffff',
});

export const toLocalAchievement = (r) => ({
  id:          r.id,
  icon:        r.icon        || '🏆',
  title:       r.title       || '',
  description: r.description || '',
  image:       r.image_url   || null,
});

export const toSupabaseAchievement = (a) => ({
  id:          a.id,
  icon:        a.icon,
  title:       a.title,
  description: a.description,
  image_url:   a.image || null,
});

export const toLocalTask = (r) => ({
  id:        r.id,
  name:      r.name      || r.task_name   || '', // handle both column variants
  event:     r.event     || r.event_name  || '',
  committee: r.committee || '',
  deadline:  r.deadline  || '',
  status:    r.status    || 'not-started',
  notes:     r.notes     || '',
});

export const toSupabaseTask = (t) => ({
  id:        t.id,
  name:      t.name,
  event:     t.event,
  committee: t.committee,
  deadline:  t.deadline || null,
  status:    t.status,
  notes:     t.notes || null,
});

/* ══ Events ════════════════════════════════════════════════════ */

export async function fetchEvents() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data.map(toLocalEvent);
}

export async function upsertEvent(event) {
  if (!supabase) throw new Error('Supabase غير مُهيَّأ');
  const { error } = await supabase.from('events').upsert(toSupabaseEvent(event));
  if (error) throw error;
}

export async function deleteEvent(id) {
  if (!supabase) throw new Error('Supabase غير مُهيَّأ');
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

/* ══ Achievements ══════════════════════════════════════════════ */

export async function fetchAchievements() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('achievements')
    .select('*');
  if (error) throw error;
  return data.map(toLocalAchievement);
}

export async function upsertAchievement(ach) {
  if (!supabase) throw new Error('Supabase غير مُهيَّأ');
  const { error } = await supabase.from('achievements').upsert(toSupabaseAchievement(ach));
  if (error) throw error;
}

export async function deleteAchievement(id) {
  if (!supabase) throw new Error('Supabase غير مُهيَّأ');
  const { error } = await supabase.from('achievements').delete().eq('id', id);
  if (error) throw error;
}

/* ══ Tasks ═════════════════════════════════════════════════════ */

export async function fetchTasks() {
  if (!supabase) return null;
  const { data, error } = await supabase.from('tasks').select('*');
  if (error) throw error;
  return data.map(toLocalTask);
}

export async function upsertTask(task) {
  if (!supabase) throw new Error('Supabase غير مُهيَّأ');
  const { error } = await supabase.from('tasks').upsert(toSupabaseTask(task));
  if (error) throw error;
}

export async function deleteTask(id) {
  if (!supabase) throw new Error('Supabase غير مُهيَّأ');
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

/* ══ Phone normalisation + UUID validation ═════════════════════ */

/**
 * Strip all non-digit characters so formatting differences
 * (spaces, hyphens, dots, parentheses, leading +) never cause mismatches.
 * e.g. "+968 9123-4567" → "96891234567"
 */
export function normalizePhone(raw) {
  return String(raw).replace(/\D/g, '');
}

/** Postgres UUID v4 pattern — used to guard against local fallback IDs like "evt-001". */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isValidUuid(id) { return UUID_RE.test(id); }

/* ══ Certificate participants ══════════════════════════════════ */

/** Look up a single participant by event_id + normalised phone. Returns { name, phone } or null. */
export async function lookupParticipant(eventId, phone) {
  if (!supabase) return null;
  const norm = normalizePhone(phone);
  if (!norm) return null;

  // Try normalised form first, then fall back to raw value for existing data
  const { data, error } = await supabase
    .from('certificate_participants')
    .select('name, phone')
    .eq('event_id', eventId)
    .or(`phone.eq.${norm},phone.eq.${phone.trim()}`)
    .limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
}

/** Fetch all participants for an event. */
export async function fetchParticipants(eventId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('certificate_participants')
    .select('id, name, phone')
    .eq('event_id', eventId)
    .order('name');
  if (error) throw error;
  return data || [];
}

/**
 * Parse CSV text → { headers: string[], rawRows: string[][] }.
 *
 * headers  = first row if it looks like labels, otherwise generated ("العمود 1" …)
 * rawRows  = data rows as raw string arrays (no mapping yet)
 *
 * Column selection is done by the caller via mapParticipantRows().
 */
export function parseParticipantsCsv(text) {
  const parseRow = (line) =>
    line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));

  const lines   = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rawRows: [] };

  const allRows   = lines.map(parseRow);
  const firstRow  = allRows[0];

  // A row looks like a header when at least one cell is non-numeric / non-phone
  const looksLikeHeader = firstRow.some(
    (c) => c && !/^\+?[\d\s\-\(\)\.]+$/.test(c)
  );

  if (looksLikeHeader) {
    return { headers: firstRow, rawRows: allRows.slice(1) };
  }
  // No header detected — generate generic labels and keep all rows as data
  return {
    headers: firstRow.map((_, i) => `العمود ${i + 1}`),
    rawRows: allRows,
  };
}

/**
 * Map raw CSV rows to { name, phone } objects using chosen column indices.
 * Phones are normalised. Empty rows are skipped.
 * Returns { rows, skippedEmpty }.
 */
export function mapParticipantRows(rawRows, nameColIdx, phoneColIdx) {
  const rows = [];
  let skippedEmpty = 0;

  for (const row of rawRows) {
    const name  = (row[nameColIdx]  || '').trim();
    const phone = normalizePhone(row[phoneColIdx] || '');
    if (!name || !phone) { skippedEmpty++; continue; }
    rows.push({ name, phone });
  }

  return { rows, skippedEmpty };
}

/**
 * Insert participants, skipping phones already stored for this event.
 * Phones are stored in normalised (digits-only) form.
 * Returns { inserted, duplicated }.
 * Throws if eventId is not a valid UUID.
 */
export async function uploadParticipants(eventId, rows) {
  if (!supabase) throw new Error('Supabase غير مُهيَّأ');
  if (!isValidUuid(eventId))
    throw new Error('يجب حفظ الفعالية في قاعدة البيانات قبل رفع المشاركين');
  if (rows.length === 0) return { inserted: 0, duplicated: 0 };

  // Fetch existing phones (normalised) for deduplication
  const { data: existing } = await supabase
    .from('certificate_participants')
    .select('phone')
    .eq('event_id', eventId);

  const existingPhones = new Set((existing || []).map((r) => normalizePhone(r.phone)));
  const newRows        = rows.filter((r) => !existingPhones.has(r.phone));
  const duplicated     = rows.length - newRows.length;

  if (newRows.length === 0) return { inserted: 0, duplicated };

  const payload = newRows.map((r) => ({ event_id: eventId, name: r.name, phone: r.phone }));
  const { error } = await supabase.from('certificate_participants').insert(payload);
  if (error) throw error;

  return { inserted: newRows.length, duplicated };
}

/** Delete a participant by id. */
export async function deleteParticipant(id) {
  if (!supabase) throw new Error('Supabase غير مُهيَّأ');
  const { error } = await supabase.from('certificate_participants').delete().eq('id', id);
  if (error) throw error;
}
