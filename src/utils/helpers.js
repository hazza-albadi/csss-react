export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('ar-OM', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const suffix = h >= 12 ? 'م' : 'ص';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function getDay(dateStr) {
  return new Date(dateStr + 'T00:00:00').getDate();
}

export function getMonthShort(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleString('ar-OM', { month: 'short' });
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
