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

/* ══ Certificate participants ══════════════════════════════════ */

/** Look up a single participant by event_id + phone. Returns { name, phone } or null. */
export async function lookupParticipant(eventId, phone) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('certificate_participants')
    .select('name, phone')
    .eq('event_id', eventId)
    .eq('phone', phone.trim())
    .maybeSingle();
  if (error) throw error;
  return data; // { name, phone } or null
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
 * Parse CSV text → array of { name, phone }.
 * Expects two columns: name, phone (header row optional).
 */
export function parseParticipantsCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { rows: [], errors: [] };

  // Detect & skip header
  const firstLower = lines[0].toLowerCase();
  const hasHeader =
    firstLower.includes('name') || firstLower.includes('اسم') ||
    firstLower.includes('phone') || firstLower.includes('هاتف');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const rows   = [];
  const errors = [];

  dataLines.forEach((line, idx) => {
    const lineNum = idx + 1 + (hasHeader ? 1 : 0);
    const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 2) {
      errors.push(`السطر ${lineNum}: يحتاج عمودَين على الأقل (الاسم، الهاتف)`);
      return;
    }
    const [name, phone] = cols;
    if (!name || !phone) {
      errors.push(`السطر ${lineNum}: بيانات ناقصة`);
      return;
    }
    rows.push({ name: name.trim(), phone: phone.trim() });
  });

  return { rows, errors };
}

/**
 * Insert participants, skipping any phone numbers already in the table for this event.
 * Returns { inserted, skipped }.
 */
export async function uploadParticipants(eventId, rows) {
  if (!supabase) throw new Error('Supabase غير مُهيَّأ');
  if (rows.length === 0) return { inserted: 0, skipped: 0 };

  // Fetch existing phones to deduplicate
  const { data: existing } = await supabase
    .from('certificate_participants')
    .select('phone')
    .eq('event_id', eventId);

  const existingPhones = new Set((existing || []).map((r) => r.phone));
  const newRows = rows.filter((r) => !existingPhones.has(r.phone));

  if (newRows.length === 0) return { inserted: 0, skipped: rows.length };

  const payload = newRows.map((r) => ({ event_id: eventId, name: r.name, phone: r.phone }));
  const { error } = await supabase.from('certificate_participants').insert(payload);
  if (error) throw error;

  return { inserted: newRows.length, skipped: rows.length - newRows.length };
}

/** Delete a participant by id. */
export async function deleteParticipant(id) {
  if (!supabase) throw new Error('Supabase غير مُهيَّأ');
  const { error } = await supabase.from('certificate_participants').delete().eq('id', id);
  if (error) throw error;
}
