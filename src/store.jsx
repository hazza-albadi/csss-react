import { createContext, useContext, useState, useCallback } from 'react';

const STORE_KEY = 'csss_v2';
export const ADMIN_PASSWORD = 'csss@2025';

/* ─── Default data ─────────────────────────────────────────── */

const DEFAULT_EVENTS = [
  {
    id: 'evt-001',
    title: 'يوم العلوم السنوي 2025',
    description:
      'حدث سنوي بارز يجمع طلاب كلية العلوم لعرض مشاريعهم البحثية وأعمالهم الإبداعية في بيئة تفاعلية محفزة، مع فرص للتواصل مع أعضاء هيئة التدريس والشركاء.',
    date: '2025-06-10',
    time: '09:00',
    location: 'مبنى كلية العلوم — القاعة الكبرى',
    image: null,
    formLink: 'https://forms.google.com',
    hasCertificate: true,
    certificateTemplate: null,
    nameX: 50,
    nameY: 55,
    nameFontSize: 52,
  },
  {
    id: 'evt-002',
    title: 'ورشة مهارات البحث العلمي',
    description:
      'ورشة تفاعلية لتطوير مهارات البحث العلمي وكتابة الأوراق الأكاديمية واستخدام قواعد البيانات العالمية، يقدمها نخبة من الأساتذة والمتخصصين.',
    date: '2025-07-02',
    time: '10:00',
    location: 'مختبر الحاسوب — المبنى الثاني',
    image: null,
    formLink: 'https://forms.google.com',
    hasCertificate: false,
    certificateTemplate: null,
    nameX: 50,
    nameY: 55,
    nameFontSize: 52,
  },
  {
    id: 'evt-003',
    title: 'معرض المشاريع الطلابية 2024',
    description:
      'عرض لأبرز مشاريع طلاب الجمعية في مجالات الكيمياء والفيزياء والأحياء وعلوم الحاسوب، مع تكريم المشاريع الفائزة بجوائز التميز والإبداع.',
    date: '2024-12-15',
    time: '09:00',
    location: 'الردهة الرئيسية — جامعة السلطان قابوس',
    image: null,
    formLink: 'https://forms.google.com',
    hasCertificate: true,
    certificateTemplate: null,
    nameX: 50,
    nameY: 55,
    nameFontSize: 52,
  },
  {
    id: 'evt-004',
    title: 'رحلة علمية: مركز الدراسات البيئية',
    description:
      'رحلة ميدانية إلى مركز الدراسات البيئية، تضمنت جولات إرشادية وجلسات تعليمية حول التنوع البيولوجي والحفاظ على النظم البيئية في سلطنة عُمان.',
    date: '2025-03-08',
    time: '07:30',
    location: 'مركز الدراسات البيئية — مسقط',
    image: null,
    formLink: 'https://forms.google.com',
    hasCertificate: false,
    certificateTemplate: null,
    nameX: 50,
    nameY: 55,
    nameFontSize: 52,
  },
];

const DEFAULT_COMMITTEES = [
  {
    id: 'com-001',
    name: 'لجنة المشاريع',
    nameEn: 'Projects',
    description:
      'تحويل الأفكار إلى مشاريع طلابية مؤثرة تخدم المجتمع الأكاديمي وتنمي المهارات العملية لدى الأعضاء.',
    formLink: 'https://forms.google.com',
    icon: 'rocket',
  },
  {
    id: 'com-002',
    name: 'لجنة العلاقات',
    nameEn: 'Relations',
    description:
      'بناء شراكات استراتيجية مع المؤسسات الأكاديمية والشركات لفتح آفاق جديدة للطلاب.',
    formLink: 'https://forms.google.com',
    icon: 'handshake',
  },
  {
    id: 'com-003',
    name: 'لجنة التنظيم',
    nameEn: 'Organization',
    description:
      'التخطيط الدقيق وتنفيذ الفعاليات بكفاءة عالية لضمان تجربة استثنائية لجميع المشاركين.',
    formLink: 'https://forms.google.com',
    icon: 'target',
  },
  {
    id: 'com-004',
    name: 'لجنة المالية',
    nameEn: 'Finance',
    description:
      'إدارة الميزانيات والتخطيط المالي بشفافية لضمان الاستدامة المالية لجميع أنشطة الجمعية.',
    formLink: 'https://forms.google.com',
    icon: 'finance',
  },
  {
    id: 'com-005',
    name: 'لجنة الإعلام',
    nameEn: 'Media',
    description:
      'التصميم وإنشاء المحتوى والتوثيق وسرد قصة الجمعية بإبداع عبر جميع المنصات الرقمية.',
    formLink: 'https://forms.google.com',
    icon: 'media',
  },
];

const DEFAULT_CONTENT = {
  heroSlogan: 'نحو تجربة طلابية\nتصنع القادة وتبني الأثر',
  heroSubtitle:
    'جماعة الأنشطة الطلابية بكلية العلوم — جامعة السلطان قابوس. نجمع الطلاب في رحلة من العلم والإبداع والقيادة.',
  aboutGoal:
    'تنمية مهارات الطلاب العلمية والشخصية، وتعزيز روح المبادرة والعمل الجماعي من خلال أنشطة وفعاليات تربط الجانب الأكاديمي بالتطبيقي.',
  aboutMission:
    'توفير بيئة محفزة تساعد الطلاب على اكتشاف قدراتهم وتطويرها عبر برامج نوعية وشراكات فعالة تعزز دور الطالب داخل وخارج الجامعة.',
  aboutImpact:
    'بناء جيل طلابي واعٍ يمتلك مهارات القيادة والعمل الجماعي والابتكار، مع تعزيز ثقافة الانتماء والمشاركة الفعالة.',
  contactEmail: 'csss@squ.edu.om',
  contactInstagram: '@csss_squ',
};

const DEFAULT_TASKS = [
  {
    id: 'task-001',
    name: 'تصميم بوستر يوم العلوم',
    event: 'يوم العلوم السنوي 2025',
    committee: 'الإعلام',
    deadline: '2025-05-28',
    status: 'in-progress',
    notes: 'يجب تسليمه قبل أسبوع من الفعالية',
  },
  {
    id: 'task-002',
    name: 'التواصل مع الرعاة',
    event: 'يوم العلوم السنوي 2025',
    committee: 'العلاقات',
    deadline: '2025-05-20',
    status: 'done',
    notes: '',
  },
  {
    id: 'task-003',
    name: 'حجز القاعة والمعدات',
    event: 'ورشة مهارات البحث',
    committee: 'التنظيم',
    deadline: '2025-06-15',
    status: 'not-started',
    notes: 'التأكد من توفر جهاز العرض',
  },
];

const DEFAULT_ACHIEVEMENTS = [
  { id: 'ach-001', icon: '🏆', title: 'أفضل جماعة طلابية 2023', description: 'تكريم الجامعة لنا كأفضل جماعة بين كليات جامعة السلطان قابوس', image: null },
  { id: 'ach-002', icon: '🤝', title: 'شراكات استراتيجية', description: 'أكثر من ١٠ شراكات مع مؤسسات أكاديمية وشركات ريادية', image: null },
  { id: 'ach-003', icon: '🌟', title: 'جائزة الإبداع الجامعي', description: 'تكريم المشاريع الإبداعية المتميزة لطلابنا على مستوى الجامعة', image: null },
];

const DEFAULT_STATS = [
  { id: 'stat-1', num: '500+', label: 'طالب مستفيد' },
  { id: 'stat-2', num: '20+',  label: 'فعالية سنوياً' },
  { id: 'stat-3', num: '5',    label: 'لجان متخصصة' },
  { id: 'stat-4', num: '3+',   label: 'سنوات تميز' },
];

const DEFAULT_STATE = {
  events: DEFAULT_EVENTS,
  committees: DEFAULT_COMMITTEES,
  content: DEFAULT_CONTENT,
  tasks: DEFAULT_TASKS,
  achievements: DEFAULT_ACHIEVEMENTS,
  stats: DEFAULT_STATS,
};

/* ─── Load / merge with defaults ───────────────────────────── */

function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return {
      events:       parsed.events       ?? DEFAULT_STATE.events,
      committees:   parsed.committees   ?? DEFAULT_STATE.committees,
      content:      { ...DEFAULT_STATE.content, ...(parsed.content ?? {}) },
      tasks:        parsed.tasks        ?? DEFAULT_STATE.tasks,
      achievements: parsed.achievements ?? DEFAULT_STATE.achievements,
      stats:        parsed.stats        ?? DEFAULT_STATE.stats,
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function persist(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

/* ─── Context ───────────────────────────────────────────────── */

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [data, setData] = useState(loadData);

  const update = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      persist(next);
      return next;
    });
  }, []);

  return <StoreCtx.Provider value={{ data, update }}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  return useContext(StoreCtx);
}

/* ─── Helpers ───────────────────────────────────────────────── */

export function isUpcoming(event) {
  return new Date(event.date + 'T' + (event.time || '00:00')) >= new Date();
}

export function nextEvent(events) {
  return [...events]
    .filter(isUpcoming)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0] ?? null;
}

export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
