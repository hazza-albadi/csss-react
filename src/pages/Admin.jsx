import { useState, useRef } from 'react';
import { useStore, generateId, ADMIN_PASSWORD } from '../store';
import { formatDate } from '../utils/helpers';

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
  const [authed, setAuthed] = useState(false);
  const [pass,   setPass]   = useState('');
  const [err,    setErr]    = useState(false);

  const tryLogin = () => {
    if (pass === ADMIN_PASSWORD) { setAuthed(true); setErr(false); }
    else { setErr(true); setPass(''); }
  };

  if (!authed) {
    return (
      <div className="admin-login-wrap">
        <div className="admin-login-card">
          <div className="admin-lock">🔐</div>
          <h2>لوحة الإدارة</h2>
          <p className="text-muted">أدخل كلمة المرور للدخول</p>
          <input
            className={`form-input${err ? ' form-input--error' : ''}`}
            type="password"
            value={pass}
            onChange={(e) => { setPass(e.target.value); setErr(false); }}
            onKeyDown={(e) => e.key === 'Enter' && tryLogin()}
            placeholder="كلمة المرور"
            autoFocus
          />
          {err && <p className="admin-error">كلمة المرور غير صحيحة</p>}
          <button className="btn btn-primary btn-full" onClick={tryLogin}>دخول</button>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={() => setAuthed(false)} />;
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
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>تسجيل الخروج</button>
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
  const [editing, setEditing] = useState(null);
  const fileRef = useRef(null);

  const blankEvent = () => ({
    id: generateId('evt'), title: '', description: '', date: '', time: '',
    location: '', image: null, formLink: '',
    hasCertificate: false, certificateTemplate: null,
    nameX: 50, nameY: 55, nameFontSize: 52, nameColor: '#ffffff',
  });

  const [form, setForm] = useState(blankEvent());

  const openNew  = ()    => { setForm(blankEvent()); setEditing('new'); };
  const openEdit = (ev)  => { setForm({ nameColor: '#ffffff', ...ev }); setEditing(ev.id); };

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

  const save = () => {
    if (!form.title.trim() || !form.date) { toast.show('العنوان والتاريخ مطلوبان', 'error'); return; }
    update((d) => {
      const idx = d.events.findIndex((e) => e.id === form.id);
      if (idx > -1) { const evts = [...d.events]; evts[idx] = form; return { ...d, events: evts }; }
      return { ...d, events: [form, ...d.events] };
    });
    toast.show(editing === 'new' ? 'تمت إضافة الفعالية' : 'تم تحديث الفعالية');
    setEditing(null);
  };

  const del = (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    update((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }));
    toast.show('تم حذف الفعالية');
  };

  const f = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  if (editing !== null) {
    return (
      <div className="admin-form-panel">
        <div className="admin-form-header">
          <h3>{editing === 'new' ? 'إضافة فعالية' : 'تعديل الفعالية'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>← رجوع</button>
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
                  ? <span className="badge badge-success" style={{marginTop:8,display:'inline-block'}}>✓ قالب مرفوع</span>
                  : <span className="text-muted" style={{fontSize:'0.82rem'}}>إذا لم يُرفع قالب سيُستخدم التصميم الافتراضي</span>
                }
                {form.certificateTemplate && (
                  <button className="btn btn-ghost btn-sm" style={{marginTop:8, display:'block'}} onClick={() => setForm(f2 => ({...f2, certificateTemplate: null}))}>
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
                <div style={{display:'flex', alignItems:'center', gap:10, marginTop:4}}>
                  <input
                    type="color"
                    value={form.nameColor || '#ffffff'}
                    onChange={f('nameColor')}
                    style={{width:44, height:36, border:'1.5px solid var(--li)', cursor:'pointer', borderRadius:6, padding:2}}
                  />
                  <span className="text-muted" style={{fontSize:'0.82rem'}}>{form.nameColor || '#ffffff'}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={save}>حفظ</button>
          <button className="btn btn-ghost" onClick={() => setEditing(null)}>إلغاء</button>
        </div>
      </div>
    );
  }

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
            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(ev)}>تعديل</button>
            <button className="btn btn-danger btn-sm" onClick={() => del(ev.id)}>حذف</button>
          </div>
        </div>
      ))}
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
              <div className="form-group" style={{marginBottom:8}}>
                <label className="form-label">الرقم {i + 1}</label>
                <input className="form-input" value={stat.num} onChange={(e) => updateStat(i, 'num', e.target.value)} placeholder="500+" />
              </div>
              <div className="form-group" style={{marginBottom:0}}>
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

  const save = () => {
    if (!form.title.trim()) { toast.show('العنوان مطلوب', 'error'); return; }
    update((d) => {
      const idx = d.achievements.findIndex((a) => a.id === form.id);
      if (idx > -1) {
        const arr = [...d.achievements]; arr[idx] = form;
        return { ...d, achievements: arr };
      }
      return { ...d, achievements: [form, ...d.achievements] };
    });
    toast.show(editing === 'new' ? 'تمت إضافة الإنجاز' : 'تم تحديث الإنجاز');
    setEditing(null);
  };

  const del = (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
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
                <button className="btn btn-ghost btn-sm" style={{marginTop:8}} onClick={() => setForm(f2 => ({...f2, image: null}))}>مسح الصورة</button>
              </>
            )}
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={save}>حفظ</button>
          <button className="btn btn-ghost" onClick={() => setEditing(null)}>إلغاء</button>
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
            <span style={{fontSize:'1.4rem', lineHeight:1}}>{a.icon}</span>
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
        <div className="empty-state" style={{padding:'40px'}}><p>لا توجد إنجازات. اضغط "+ إضافة" للبدء.</p></div>
      )}
    </div>
  );
}

/* ══ TASKS TAB — Grouped by committee ═══════════════════════ */
function TasksTab({ data, update, toast }) {
  const [editId, setEditId] = useState(null);
  const [draft,  setDraft]  = useState({});

  const newTask = (committee) => {
    const t = {
      id: generateId('task'), name: '', event: '',
      committee, deadline: '', status: 'not-started', notes: '',
    };
    update((d) => ({ ...d, tasks: [t, ...d.tasks] }));
    setEditId(t.id);
    setDraft(t);
  };

  const startEdit = (t) => { setEditId(t.id); setDraft({ ...t }); };

  const saveEdit = () => {
    update((d) => ({ ...d, tasks: d.tasks.map((t) => t.id === editId ? draft : t) }));
    setEditId(null);
    toast.show('تم حفظ المهمة');
  };

  const del = (id) => {
    update((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }));
    toast.show('تم حذف المهمة');
  };

  const df = (key) => (e) => setDraft((p) => ({ ...p, [key]: e.target.value }));

  const totalCount = (data.tasks || []).length;

  return (
    <div className="admin-tasks-panel">
      <div className="admin-list-header" style={{marginBottom:28}}>
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
