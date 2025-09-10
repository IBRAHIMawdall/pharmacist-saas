const API_BASE = process.env.REACT_APP_API_BASE || 'https://pharmassist-pro-backend.onrender.com';

export function getApiBase() {
  return API_BASE;
}

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${text}`.trim());
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return handle(res);
}

export async function searchDiagnoses(search) {
  const url = new URL(`${API_BASE}/api/diagnoses`);
  if (search && search.trim()) url.searchParams.set('search', search.trim());
  const res = await fetch(url.toString());
  return handle(res);
}

export async function getTreatments(code) {
  const res = await fetch(`${API_BASE}/api/treatments/${encodeURIComponent(code)}`);
  return handle(res);
}

export function buildExportUrl(code, format) {
  const url = new URL(`${API_BASE}/api/export/${encodeURIComponent(code)}`);
  if (format) url.searchParams.set('format', format);
  return url.toString();
}
