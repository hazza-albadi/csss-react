import { useEffect, useState, useRef } from 'react';
import { useStore, generateId } from '../store';
import { formatDate } from '../utils/helpers';
import { supabase, isSupabaseReady } from '../lib/supabase';
import {
  upsertEvent,   deleteEvent,
  upsertAchievement, deleteAchievement,
  upsertTask,    deleteTask,
  fetchParticipants, uploadParticipants, deleteParticipant,
  parseParticipantsCsv, mapParticipantRows, isValidUuid,
} from '../lib/db';

/* ════════════════════════════════════════════════════════════
   ADMIN PANEL
   Password: csss@2025  (change in src/store.jsx → ADMIN_PASSWORD)
   ════════════════════════════════════════════════════════════ */

const TABS = [
  { id: 'events',       label: 'الفعاليات'   },
  { id: 'committees',   label: 'اللجان'       },
  { id: 'content',      label: 'المحتوى'      },
  { id: 'achievements', label: 'الإنجازات'    },
  { id: 'tasks',        label: 'إدارة المهام' },
];

const STATUS_LABELS = { 'not-started': 'لم يبدأ', 'in-progress': 'جارٍ', 'done': 'مكتمل' };
const STATUS_COLORS = { 'not-started': 'status-ns', 'in-progress': 'status-ip', 'done': 'status-dn' };
const COM_SECTIONS  = ['المشاريع', 'الإعلام', 'العلاقات', 'التنظيم', 'المالية'];

export default function Admin() {
  // undefined = still loading session, null = no session, object = active session
  const [session, setSession] = useState(undefined);
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [err,     setErr]     = useState('');
  const [loading, setLoading] = useState(false);

  /* ── Check session on mount + subscribe to auth changes ── */
  useEffect(() => {
    if (!supabase) {
      setSession(null); // no Supabase → always show login (will fail gracefully)
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) { setErr('حدث خطأ في تسجيل الدخول'); return; }
    setLoading(true);
    setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      setErr(error.status === 400 ? 'بيانات الدخول غير صحيحة' : 'حدث خطأ في تسجيل الدخول');
    }
    // On success, onAuthStateChange fires → setSession → re-render to dashboard
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase?.auth.signOut();
  };

  /* ── Loading session check ── */
  if (session === undefined) {
    return (
      <div className="admin-login-wrap">
        <div className="admin-login-card" style={{ textAlign: 'center' }}>
          <p className="text-muted">جارٍ التحقق من الجلسة…</p>
        </div>
      </div>
    );
  }

  /* ── Not logged in → show login form ── */
  if (!session) {
    return (
      <div className="admin-login-wrap">
        <div className="admin-login-card">
          <div className="admin-lock">🔐</div>
          <h2>لوحة الإدارة</h2>
          <p className="text-muted">أدخل بيانات الدخول للمتابعة</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErr(''); }}
                placeholder="البريد الإلكتروني"
                dir="ltr"
                autoFocus
                required
              />
            </div>
            <div className="form-group" style={{ marginTop: 12 }}>
              <input
                className={`form-input${err ? ' form-input--error' : ''}`}
                type="password"
                value={pass}
                onChange={(e) => { setPass(e.target.value); setErr(''); }}
                placeholder="كلمة المرور"
                required
              />
            </div>
            {err && <p className="admin-error">{err}</p>}
            <button
              className="btn btn-primary btn-full"
              type="submit"
              disabled={loading}
              style={{ marginTop: 16 }}
            >
              {loading ? 'جارٍ تسجيل الدخول…' : 'دخول'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Logged in → show dashboard ── */
  return <AdminDashboard onLogout={handleLogout} />;
}

/* ── Dashboard shell ── */
function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('events');
  const { data, update } = useStore();
  const toast = useToast();

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1 className="admin-title">لوحة الإدارة</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isSupabaseReady
              ? <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>● Supabase متصل</span>
              : <span className="badge badge-muted"   style={{ fontSize: '0.75rem' }}>○ وضع محلي فقط</span>
            }
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>تسجيل الخروج</button>
          </div>
        </div>

        <div className="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`admin-tab${tab === t.id ? ' admin-tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'events'       && <EventsTab       data={data} update={update} toast={toast} />}
        {tab === 'committees'   && <CommitteesTab    data={data} update={update} toast={toast} />}
        {tab === 'content'      && <ContentTab       data={data} update={update} toast={toast} />}
        {tab === 'achievements' && <AchievementsTab  data={data} update={update} toast={toast} />}
        {tab === 'tasks'        && <TasksTab         data={data} update={update} toast={toast} />}
      </div>

      {toast.msg && (
        <div className={`toast toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}

/* ══ EVENTS TAB ══════════════════════════════════════════════ */
function EventsTab({ data, update, toast }) {
  const [view,    setView]    = useState('list');   // 'list' | 'form' | 'participants'
  const [editing, setEditing] = useState(null);
  const [partEvt, setPartEvt] = useState(null);     // event for participant management
  const [saving,  setSaving]  = useState(false);
  const fileRef = useRef(null);

  const blankEvent = () => ({
    id: generateId('evt'), title: '', description: '', date: '', time: '',
    location: '', image: null, formLink: '',
    hasCertificate: false, certificateTemplate: null,
    nameX: 50, nameY: 55, nameFontSize: 52, nameColor: '#ffffff',
  });

  const [form, setForm] = useState(blankEvent());

  const openNew  = ()    => { setForm(blankEvent()); setEditing('new'); setView('form'); };
  const openEdit = (ev)  => { setForm({ nameColor: '#ffffff', ...ev }); setEditing(ev.id); setView('form'); };
  const openPart = async (ev) => {
    let target = ev;

    // If the event has a local/fake id, auto-save it to Supabase first
    // so we get a real UUID before opening the participants panel.
    if (!isValidUuid(ev.id)) {
      try {
        target = await upsertEvent(ev);
        // Swap the old local entry with the Supabase-persisted one
        update((d) => {
          const idx = d.events.findIndex((e) => e.id === ev.id);
          if (idx > -1) {
            const evts = [...d.events];
            evts[idx] = target;
            return { ...d, events: evts };
          }
          return d;
        });
      } catch {
        toast.show('تعذّر حفظ الفعالية في قاعدة البيانات. يرجى المحاولة مرة أخرى.', 'error');
        return;
      }
    }

    setPartEvt(target);
    setView('participants');
  };
  const backList = ()    => { setView('list'); setEditing(null); setPartEvt(null); };

  const handleImage = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (r) => setForm((f) => ({ ...f, image: r.target.result }));
    reader.readAsDataURL(file);
  };

  const handleCertTemplate = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (r) => setForm((f) => ({ ...f, certificateTemplate: r.target.result }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!form.title.trim() || !form.date) { toast.show('العنوان والتاريخ مطلوبان', 'error'); return; }
    setSaving(true);

    const hadFakeId = !isValidUuid(form.id);
    let savedEvent  = form; // fallback to local copy if Supabase fails

    try {
      // upsertEvent returns the persisted row (with real UUID when id was fake)
      savedEvent = await upsertEvent(form);
    } catch (err) {
      console.warn('Supabase upsert error:', err);
      toast.show('تم الحفظ محلياً — تعذّر الاتصال بقاعدة البيانات', 'error');
    }

    // Replace the old local entry (matched by the OLD id) with the saved one
    update((d) => {
      const oldId = form.id;
      const idx   = d.events.findIndex((e) => e.id === oldId);
      if (idx > -1) { const evts = [...d.events]; evts[idx] = savedEvent; return { ...d, events: evts }; }
      return { ...d, events: [savedEvent, ...d.events] };
    });

    // Show a special message when a fake id was promoted to a real UUID
    if (hadFakeId && isValidUuid(savedEvent.id)) {
      toast.show('تم حفظ الفعالية في قاعدة البيانات ويمكن الآن إدارة المشاركين');
    } else {
      toast.show(editing === 'new' ? 'تمت إضافة الفعالية' : 'تم تحديث الفعالية');
    }

    setSaving(false);
    backList();
  };

  const del = async (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try { await deleteEvent(id); } catch (err) { console.warn('Supabase delete error:', err); }
    update((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }));
    toast.show('تم حذف الفعالية');
  };

  const f = (key) => (e) => setForm((prev) => ({
    ...prev,
    [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));

  /* ── Participants view ── */
  if (view === 'participants' && partEvt) {
    return <ParticipantsPanel event={partEvt} onBack={backList} toast={toast} />;
  }

  /* ── Form view ── */
  if (view === 'form') {
    return (
      <div className="admin-form-panel">
        <div className="admin-form-header">
          <h3>{editing === 'new' ? 'إضافة فعالية' : 'تعديل الفعالية'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={backList}>← رجوع</button>
        </div>

        <div className="admin-form-grid">
          <div className="form-group form-full">
            <label className="form-label">العنوان *</label>
            <input className="form-input" value={form.title} onChange={f('title')} placeholder="عنوان الفعالية" />
          </div>
          <div className="form-group form-full">
            <label className="form-label">الوصف</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={f('description')} placeholder="وصف الفعالية" />
          </div>
          <div className="form-group">
            <label className="form-label">التاريخ *</label>
            <input className="form-input" type="date" value={form.date} onChange={f('date')} />
          </div>
          <div className="form-group">
            <label className="form-label">الوقت</label>
            <input className="form-input" type="time" value={form.time} onChange={f('time')} />
          </div>
          <div className="form-group form-full">
            <label className="form-label">الموقع</label>
            <input className="form-input" value={form.location} onChange={f('location')} placeholder="مكان الفعالية" />
          </div>
          <div className="form-group form-full">
            <label className="form-label">رابط Google Form (التسجيل)</label>
            <input className="form-input" type="url" value={form.formLink} onChange={f('formLink')} placeholder="https://forms.google.com/…" />
          </div>

          {/* Image */}
          <div className="form-group form-full">
            <label className="form-label">صورة الفعالية</label>
            <input ref={fileRef} type="file" accept="image/*" className="form-input" onChange={handleImage} />
            {form.image && <img src={form.image} className="preview-img" alt="preview" />}
          </div>

          {/* Certificate toggle */}
          <div className="form-group form-full">
            <label className="toggle-label">
              <input type="checkbox" checked={form.hasCertificate} onChange={f('hasCertificate')} className="toggle-check" />
              <span className="toggle-ui" />
              تفعيل شهادة المشاركة لهذه الفعالية
            </label>
          </div>

          {form.hasCertificate && (
            <>
              <div className="form-group form-full">
                <label className="form-label">قالب الشهادة (PNG/JPG) — اختياري</label>
                <p className="cert-upload-warning">⚠️ المقاس المعتمد للشهادة: 1200 × 850 بكسل. يرجى الالتزام بنفس النسبة لتجنب تشوه التصميم.</p>
                <input type="file" accept="image/*" className="form-input" onChange={handleCertTemplate} />
                {form.certificateTemplate
                  ? <span className="badge badge-success" style={{ marginTop: 8, display: 'inline-block' }}>✓ قالب مرفوع</span>
                  : <span className="text-muted" style={{ fontSize: '0.82rem' }}>إذا لم يُرفع قالب سيُستخدم التصميم الافتراضي</span>
                }
                {form.certificateTemplate && (
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, display: 'block' }} onClick={() => setForm((f2) => ({ ...f2, certificateTemplate: null }))}>
                    مسح القالب
                  </button>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">موضع X للاسم (%)</label>
                <input className="form-input" type="number" min={0} max={100} value={form.nameX} onChange={f('nameX')} />
              </div>
              <div className="form-group">
                <label className="form-label">موضع Y للاسم (%)</label>
                <input className="form-input" type="number" min={0} max={100} value={form.nameY} onChange={f('nameY')} />
              </div>
              <div className="form-group">
                <label className="form-label">حجم الخط</label>
                <input className="form-input" type="number" min={16} max={120} value={form.nameFontSize} onChange={f('nameFontSize')} />
              </div>
              <div className="form-group">
                <label className="form-label">لون اسم المشارك</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <input
                    type="color"
                    value={form.nameColor || '#ffffff'}
                    onChange={f('nameColor')}
                    style={{ width: 44, height: 36, border: '1.5px solid var(--li)', cursor: 'pointer', borderRadius: 6, padding: 2 }}
                  />
                  <span className="text-muted" style={{ fontSize: '0.82rem' }}>{form.nameColor || '#ffffff'}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'جارٍ الحفظ…' : 'حفظ'}
          </button>
          <button className="btn btn-ghost" onClick={backList} disabled={saving}>إلغاء</button>
        </div>
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div className="admin-list-panel">
      <div className="admin-list-header">
        <h3>الفعاليات ({data.events.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ إضافة</button>
      </div>
      {data.events.map((ev) => (
        <div key={ev.id} className="admin-row">
          <div className="admin-row-info">
            <span className={`badge ${ev.hasCertificate ? 'badge-accent' : 'badge-muted'}`}>
              {ev.hasCertificate ? '🎓 شهادة' : 'بدون شهادة'}
            </span>
            <strong>{ev.title}</strong>
            <span className="text-muted">{formatDate(ev.date)}</span>
          </div>
          <div className="admin-row-actions">
            {ev.hasCertificate && isSupabaseReady && (
              <button className="btn btn-ghost btn-sm" onClick={() => openPart(ev)}>المشاركون</button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(ev)}>تعديل</button>
            <button className="btn btn-danger btn-sm" onClick={() => del(ev.id)}>حذف</button>
          </div>
        </div>
      ))}
      {data.events.length === 0 && (
        <div className="empty-state" style={{ padding: '40px' }}><p>لا توجد فعاليات. اضغط "+ إضافة" للبدء.</p></div>
      )}
    </div>
  );
}

/* ══ PARTICIPANTS PANEL (CSV upload + list) ═══════════════════ */
function ParticipantsPanel({ event, onBack, toast }) {
  const csvRef = useRef(null);

  // Existing participants list
  const [participants, setParticipants] = useState(null);
  const [loading,      setLoading]      = useState(false);

  // CSV multi-step: 0 = idle, 1 = column mapping
  const [csvStep,    setCsvStep]    = useState(0);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRawRows, setCsvRawRows] = useState([]);
  const [nameColIdx, setNameColIdx] = useState(0);
  const [phoneColIdx,setPhoneColIdx]= useState(1);
  const [uploading,  setUploading]  = useState(false);
  const [uploadSummary, setUploadSummary] = useState(null); // { inserted, duplicated, skippedEmpty }

  const load = async () => {
    setLoading(true);
    try {
      const rows = await fetchParticipants(event.id);
      setParticipants(rows);
    } catch {
      toast.show('تعذّر تحميل قائمة المشاركين', 'error');
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  if (participants === null && !loading) { load(); }

  /* ── Step 1: select file, read headers ── */
  const handleCsvSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const { headers, rawRows } = parseParticipantsCsv(text);
    if (rawRows.length === 0) { toast.show('لم يُعثر على بيانات في الملف', 'error'); return; }
    setCsvHeaders(headers);
    setCsvRawRows(rawRows);
    setNameColIdx(0);
    setPhoneColIdx(Math.min(1, headers.length - 1));
    setUploadSummary(null);
    setCsvStep(1);
  };

  /* ── Step 2: confirm + upload ── */
  const handleUpload = async () => {
    if (nameColIdx === phoneColIdx) {
      toast.show('يجب اختيار عمودَين مختلفَين للاسم والهاتف', 'error'); return;
    }
    const { rows, skippedEmpty } = mapParticipantRows(csvRawRows, nameColIdx, phoneColIdx);
    if (rows.length === 0) { toast.show('لا توجد صفوف صالحة للرفع', 'error'); return; }
    setUploading(true);
    try {
      const { inserted, duplicated } = await uploadParticipants(event.id, rows);
      setUploadSummary({ inserted, duplicated, skippedEmpty });
      setCsvStep(0);
      if (csvRef.current) csvRef.current.value = '';
      await load();
    } catch (err) {
      toast.show('فشل رفع البيانات: ' + (err.message || 'خطأ غير معروف'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const cancelCsv = () => { setCsvStep(0); if (csvRef.current) csvRef.current.value = ''; };

  const del = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشارك؟')) return;
    try {
      await deleteParticipant(id);
      setParticipants((p) => p.filter((r) => r.id !== id));
      toast.show('تم حذف المشارك');
    } catch { toast.show('تعذّر حذف المشارك', 'error'); }
  };

  return (
    <div className="admin-list-panel">
      <div className="admin-form-header">
        <div>
          <h3>مشاركو الشهادة</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem', margin: '4px 0 0' }}>{event.title}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← رجوع</button>
      </div>

      {/* ── CSV upload section ── */}
      <div className="content-fieldset" style={{ marginBottom: 24 }}>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>رفع قائمة المشاركين (CSV)</p>

        {/* Step 0 — file picker */}
        {csvStep === 0 && (
          <>
            <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: 12 }}>
              ارفع ملف CSV بأي تنسيق. ستختار عمودَي الاسم والهاتف بعد القراءة.
              أرقام الهاتف المكررة تُتجاهَل تلقائيًا.
            </p>
            <input
              ref={csvRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              className="form-input"
              onChange={handleCsvSelect}
            />
          </>
        )}

        {/* Step 1 — column mapping + preview */}
        {csvStep === 1 && (
          <>
            <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: 14 }}>
              تم قراءة <strong>{csvRawRows.length}</strong> صف.
              حدّد أي عمود يمثّل الاسم وأيها يمثّل رقم الهاتف.
            </p>

            <div className="admin-form-grid" style={{ marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">عمود الاسم</label>
                <select className="form-input" value={nameColIdx} onChange={(e) => setNameColIdx(Number(e.target.value))}>
                  {csvHeaders.map((h, i) => <option key={i} value={i}>{h || `العمود ${i + 1}`}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">عمود رقم الهاتف</label>
                <select className="form-input" value={phoneColIdx} onChange={(e) => setPhoneColIdx(Number(e.target.value))}>
                  {csvHeaders.map((h, i) => <option key={i} value={i}>{h || `العمود ${i + 1}`}</option>)}
                </select>
              </div>
            </div>

            {/* Preview first 3 data rows */}
            <div style={{ marginBottom: 14, overflowX: 'auto' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>معاينة (أول ٣ صفوف):</p>
              <table style={{ fontSize: '0.8rem', borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '4px 10px', background: 'var(--bg2,#f5f5f5)', textAlign: 'right', borderBottom: '1px solid var(--li)' }}>الاسم</th>
                    <th style={{ padding: '4px 10px', background: 'var(--bg2,#f5f5f5)', textAlign: 'right', borderBottom: '1px solid var(--li)' }}>الهاتف</th>
                  </tr>
                </thead>
                <tbody>
                  {csvRawRows.slice(0, 3).map((row, i) => (
                    <tr key={i}>
                      <td style={{ padding: '4px 10px', borderBottom: '1px solid var(--li)' }}>{row[nameColIdx] || '—'}</td>
                      <td style={{ padding: '4px 10px', borderBottom: '1px solid var(--li)' }} dir="ltr">{row[phoneColIdx] || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary btn-sm" onClick={handleUpload} disabled={uploading}>
                {uploading ? 'جارٍ الرفع…' : `تأكيد الرفع (${csvRawRows.length} صف)`}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={cancelCsv} disabled={uploading}>إلغاء</button>
            </div>
          </>
        )}

        {/* Upload summary */}
        {uploadSummary && csvStep === 0 && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(16,185,129,.08)', borderRadius: 'var(--r-md)', border: '1px solid rgba(16,185,129,.2)', fontSize: '0.84rem' }}>
            ✓ مشاركون جدد: <strong>{uploadSummary.inserted}</strong>
            {uploadSummary.duplicated  > 0 && <span style={{ marginRight: 10 }}>· مكرر متجاهَل: {uploadSummary.duplicated}</span>}
            {uploadSummary.skippedEmpty > 0 && <span style={{ marginRight: 10 }}>· صفوف فارغة: {uploadSummary.skippedEmpty}</span>}
          </div>
        )}
      </div>

      {/* ── Participants list ── */}
      {loading && <p className="text-muted" style={{ textAlign: 'center', padding: 24 }}>جارٍ التحميل…</p>}

      {!loading && participants !== null && (
        <>
          <div className="admin-list-header" style={{ marginBottom: 12 }}>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>{participants.length} مشارك</span>
          </div>
          {participants.length === 0
            ? <p className="text-muted" style={{ padding: '20px 0', textAlign: 'center' }}>لا يوجد مشاركون مسجّلون بعد</p>
            : participants.map((p) => (
                <div key={p.id} className="admin-row">
                  <div className="admin-row-info">
                    <strong>{p.name}</strong>
                    <span className="text-muted" dir="ltr">{p.phone}</span>
                  </div>
                  <div className="admin-row-actions">
                    <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>حذف</button>
                  </div>
                </div>
              ))
          }
        </>
      )}
    </div>
  );
}

/* ══ COMMITTEES TAB ══════════════════════════════════════════ */
function CommitteesTab({ data, update, toast }) {
  const [forms, setForms] = useState(() =>
    Object.fromEntries(data.committees.map((c) => [c.id, { desc: c.description, link: c.formLink }]))
  );

  const save = (id) => {
    update((d) => ({
      ...d,
      committees: d.committees.map((c) =>
        c.id === id ? { ...c, description: forms[id].desc, formLink: forms[id].link } : c
      ),
    }));
    toast.show('تم الحفظ');
  };

  return (
    <div className="admin-list-panel">
      <h3 style={{ marginBottom: 20 }}>إعدادات اللجان</h3>
      {data.committees.map((c) => (
        <div key={c.id} className="admin-committee-block">
          <strong className="com-block-name">{c.name}</strong>
          <div className="form-group">
            <label className="form-label">الوصف</label>
            <textarea
              className="form-input"
              rows={2}
              value={forms[c.id]?.desc ?? c.description}
              onChange={(e) => setForms((f) => ({ ...f, [c.id]: { ...f[c.id], desc: e.target.value } }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">رابط Google Form</label>
            <input
              className="form-input"
              type="url"
              value={forms[c.id]?.link ?? c.formLink}
              onChange={(e) => setForms((f) => ({ ...f, [c.id]: { ...f[c.id], link: e.target.value } }))}
              placeholder="https://forms.google.com/…"
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => save(c.id)}>حفظ</button>
        </div>
      ))}
    </div>
  );
}

/* ══ CONTENT TAB ════════════════════════════════════════════ */
function ContentTab({ data, update, toast }) {
  const [form,      setForm]      = useState({ ...data.content });
  const [statsForm, setStatsForm] = useState([...(data.stats || [])]);

  const f = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const updateStat = (i, key, val) =>
    setStatsForm((s) => s.map((item, j) => j === i ? { ...item, [key]: val } : item));

  const save = () => {
    update((d) => ({ ...d, content: form, stats: statsForm }));
    toast.show('تم حفظ المحتوى');
  };

  return (
    <div className="admin-form-panel">
      <h3 style={{ marginBottom: 20 }}>تعديل محتوى الموقع</h3>

      <fieldset className="content-fieldset">
        <legend>الصفحة الرئيسية</legend>
        <div className="form-group">
          <label className="form-label">شعار الهيرو (استخدم سطرًا جديدًا للفصل)</label>
          <textarea className="form-input" rows={2} value={form.heroSlogan} onChange={f('heroSlogan')} />
        </div>
        <div className="form-group">
          <label className="form-label">النص التعريفي</label>
          <textarea className="form-input" rows={2} value={form.heroSubtitle} onChange={f('heroSubtitle')} />
        </div>
      </fieldset>

      <fieldset className="content-fieldset">
        <legend>الإحصائيات (٤ عناصر ثابتة)</legend>
        <div className="stats-edit-grid">
          {statsForm.map((stat, i) => (
            <div key={stat.id} className="stats-edit-item">
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">الرقم {i + 1}</label>
                <input className="form-input" value={stat.num} onChange={(e) => updateStat(i, 'num', e.target.value)} placeholder="500+" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">التسمية</label>
                <input className="form-input" value={stat.label} onChange={(e) => updateStat(i, 'label', e.target.value)} placeholder="طالب مستفيد" />
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="content-fieldset">
        <legend>صفحة عن الجماعة</legend>
        <div className="form-group">
          <label className="form-label">الهدف</label>
          <textarea className="form-input" rows={3} value={form.aboutGoal} onChange={f('aboutGoal')} />
        </div>
        <div className="form-group">
          <label className="form-label">الرسالة</label>
          <textarea className="form-input" rows={3} value={form.aboutMission} onChange={f('aboutMission')} />
        </div>
        <div className="form-group">
          <label className="form-label">الأثر</label>
          <textarea className="form-input" rows={3} value={form.aboutImpact} onChange={f('aboutImpact')} />
        </div>
      </fieldset>

      <fieldset className="content-fieldset">
        <legend>معلومات التواصل</legend>
        <div className="form-group">
          <label className="form-label">البريد الإلكتروني</label>
          <input className="form-input" type="email" value={form.contactEmail} onChange={f('contactEmail')} placeholder="csss@squ.edu.om" />
        </div>
        <div className="form-group">
          <label className="form-label">إنستغرام</label>
          <input className="form-input" value={form.contactInstagram} onChange={f('contactInstagram')} placeholder="@csss_squ" />
        </div>
      </fieldset>

      <button className="btn btn-primary" onClick={save}>حفظ جميع التغييرات</button>
    </div>
  );
}

/* ══ ACHIEVEMENTS TAB ═══════════════════════════════════════ */
function AchievementsTab({ data, update, toast }) {
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const fileRef = useRef(null);

  const blank = () => ({ id: generateId('ach'), icon: '🏆', title: '', description: '', image: null });
  const [form, setForm] = useState(blank());

  const openNew  = ()    => { setForm(blank()); setEditing('new'); };
  const openEdit = (a)   => { setForm({ ...a }); setEditing(a.id); };

  const handleImage = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (r) => setForm((f) => ({ ...f, image: r.target.result }));
    reader.readAsDataURL(file);
  };

  const af = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const save = async () => {
    if (!form.title.trim()) { toast.show('العنوان مطلوب', 'error'); return; }
    setSaving(true);
    try {
      await upsertAchievement(form);
    } catch (err) {
      console.warn('Supabase upsert error:', err);
      toast.show('تم الحفظ محلياً — تعذّر الاتصال بقاعدة البيانات', 'error');
    }
    update((d) => {
      const idx = d.achievements.findIndex((a) => a.id === form.id);
      if (idx > -1) {
        const arr = [...d.achievements]; arr[idx] = form;
        return { ...d, achievements: arr };
      }
      return { ...d, achievements: [form, ...d.achievements] };
    });
    toast.show(editing === 'new' ? 'تمت إضافة الإنجاز' : 'تم تحديث الإنجاز');
    setSaving(false);
    setEditing(null);
  };

  const del = async (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try { await deleteAchievement(id); } catch (err) { console.warn('Supabase delete error:', err); }
    update((d) => ({ ...d, achievements: d.achievements.filter((a) => a.id !== id) }));
    toast.show('تم حذف الإنجاز');
  };

  if (editing !== null) {
    return (
      <div className="admin-form-panel">
        <div className="admin-form-header">
          <h3>{editing === 'new' ? 'إضافة إنجاز' : 'تعديل الإنجاز'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>← رجوع</button>
        </div>
        <div className="admin-form-grid">
          <div className="form-group">
            <label className="form-label">الأيقونة (emoji)</label>
            <input className="form-input" value={form.icon} onChange={af('icon')} placeholder="🏆" />
          </div>
          <div className="form-group">
            <label className="form-label">العنوان *</label>
            <input className="form-input" value={form.title} onChange={af('title')} placeholder="عنوان الإنجاز" />
          </div>
          <div className="form-group form-full">
            <label className="form-label">الوصف</label>
            <textarea className="form-input" rows={2} value={form.description} onChange={af('description')} placeholder="وصف الإنجاز" />
          </div>
          <div className="form-group form-full">
            <label className="form-label">صورة بديلة للأيقونة (اختياري)</label>
            <input ref={fileRef} type="file" accept="image/*" className="form-input" onChange={handleImage} />
            {form.image && (
              <>
                <img src={form.image} className="preview-img" alt="preview" />
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => setForm((f2) => ({ ...f2, image: null }))}>مسح الصورة</button>
              </>
            )}
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'جارٍ الحفظ…' : 'حفظ'}</button>
          <button className="btn btn-ghost" onClick={() => setEditing(null)} disabled={saving}>إلغاء</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-list-panel">
      <div className="admin-list-header">
        <h3>الإنجازات ({(data.achievements || []).length})</h3>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ إضافة</button>
      </div>
      {(data.achievements || []).map((a) => (
        <div key={a.id} className="admin-row">
          <div className="admin-row-info">
            <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{a.icon}</span>
            <strong>{a.title}</strong>
            <span className="text-muted">{a.description?.slice(0, 60)}{a.description?.length > 60 ? '…' : ''}</span>
          </div>
          <div className="admin-row-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>تعديل</button>
            <button className="btn btn-danger btn-sm" onClick={() => del(a.id)}>حذف</button>
          </div>
        </div>
      ))}
      {(data.achievements || []).length === 0 && (
        <div className="empty-state" style={{ padding: '40px' }}><p>لا توجد إنجازات. اضغط "+ إضافة" للبدء.</p></div>
      )}
    </div>
  );
}

/* ══ TASKS TAB — Grouped by committee ═══════════════════════ */
function TasksTab({ data, update, toast }) {
  const [editId, setEditId] = useState(null);
  const [draft,  setDraft]  = useState({});

  const newTask = async (committee) => {
    const t = {
      id: generateId('task'), name: '', event: '',
      committee, deadline: '', status: 'not-started', notes: '',
    };
    // Add to local store first for immediate UI feedback
    update((d) => ({ ...d, tasks: [t, ...d.tasks] }));
    // Persist to Supabase (don't block UI)
    try { await upsertTask(t); } catch (err) { console.warn('Supabase upsert error:', err); }
    setEditId(t.id);
    setDraft(t);
  };

  const startEdit = (t) => { setEditId(t.id); setDraft({ ...t }); };

  const saveEdit = async () => {
    update((d) => ({ ...d, tasks: d.tasks.map((t) => t.id === editId ? draft : t) }));
    try { await upsertTask(draft); } catch (err) {
      console.warn('Supabase upsert error:', err);
      toast.show('تم الحفظ محلياً — تعذّر الاتصال بقاعدة البيانات', 'error');
    }
    setEditId(null);
    toast.show('تم حفظ المهمة');
  };

  const del = async (id) => {
    update((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }));
    try { await deleteTask(id); } catch (err) { console.warn('Supabase delete error:', err); }
    toast.show('تم حذف المهمة');
  };

  const df = (key) => (e) => setDraft((p) => ({ ...p, [key]: e.target.value }));

  const totalCount = (data.tasks || []).length;

  return (
    <div className="admin-tasks-panel">
      <div className="admin-list-header" style={{ marginBottom: 28 }}>
        <h3>إدارة المهام ({totalCount})</h3>
      </div>

      {COM_SECTIONS.map((com) => {
        const tasks = (data.tasks || []).filter((t) => t.committee === com);
        return (
          <div key={com} className="tasks-section">
            <div className="tasks-section-header">
              <h4 className="tasks-section-title">{com}</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => newTask(com)}>+ مهمة</button>
            </div>

            <div className="tasks-table-wrap">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>المهمة</th>
                    <th>الفعالية</th>
                    <th>الموعد</th>
                    <th>الحالة</th>
                    <th>ملاحظات</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 && (
                    <tr><td colSpan={6} className="tasks-empty">لا توجد مهام في هذه اللجنة</td></tr>
                  )}
                  {tasks.map((task) =>
                    editId === task.id ? (
                      <tr key={task.id} className="task-row task-row--editing">
                        <td><input className="task-input" value={draft.name}     onChange={df('name')}     placeholder="اسم المهمة" /></td>
                        <td><input className="task-input" value={draft.event}    onChange={df('event')}    placeholder="الفعالية" /></td>
                        <td><input className="task-input" type="date" value={draft.deadline} onChange={df('deadline')} /></td>
                        <td>
                          <select className="task-input" value={draft.status} onChange={df('status')}>
                            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        </td>
                        <td><input className="task-input" value={draft.notes} onChange={df('notes')} placeholder="ملاحظات" /></td>
                        <td className="task-actions">
                          <button className="btn btn-primary btn-xs" onClick={saveEdit}>✓</button>
                          <button className="btn btn-ghost btn-xs" onClick={() => setEditId(null)}>✕</button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={task.id} className="task-row" onClick={() => startEdit(task)}>
                        <td className="task-name">{task.name || <em className="text-muted">بدون عنوان</em>}</td>
                        <td>{task.event}</td>
                        <td>{task.deadline ? formatDate(task.deadline) : '—'}</td>
                        <td><span className={`status-badge ${STATUS_COLORS[task.status]}`}>{STATUS_LABELS[task.status]}</span></td>
                        <td className="task-notes">{task.notes}</td>
                        <td className="task-actions" onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-danger btn-xs" onClick={() => del(task.id)}>✕</button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Toast hook ── */
function useToast() {
  const [state, setState] = useState({ msg: null, type: 'success' });
  const timerRef = useRef(null);
  const show = (msg, type = 'success') => {
    clearTimeout(timerRef.current);
    setState({ msg, type });
    timerRef.current = setTimeout(() => setState({ msg: null, type: 'success' }), 3000);
  };
  return { msg: state.msg, type: state.type, show };
}
