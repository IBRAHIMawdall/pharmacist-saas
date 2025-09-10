import React, { useEffect, useState } from 'react';

import { getApiBase, getHealth, searchDiagnoses, getTreatments, buildExportUrl } from './services/api';

function App() {
  const [query, setQuery] = useState('');
  const [diagnoses, setDiagnoses] = useState([]);
  const [loadingDiag, setLoadingDiag] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [loadingTreatments, setLoadingTreatments] = useState(false);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(() => {
      setLoadingDiag(true);
      searchDiagnoses(query)
        .then((data) => { setDiagnoses(data); setError(null); })
        .catch((e) => { if (e.name !== 'AbortError') setError('Failed to load diagnoses'); })
        .finally(() => setLoadingDiag(false));
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query]);

  useEffect(() => {
    if (!selected) { setTreatments([]); return; }
    setLoadingTreatments(true);
    getTreatments(selected.code)
      .then((data) => setTreatments(data))
      .catch(() => setError('Failed to load treatments'))
      .finally(() => setLoadingTreatments(false));
  }, [selected]);

  const ExportButtons = ({ code }) => (
    <div className="flex gap-2 mt-2">
      <a
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        href={buildExportUrl(code, 'json')}
        target="_blank"
        rel="noreferrer"
        aria-label={`Export ${code} as JSON`}
      >
        Export JSON
      </a>
      <a
        className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        href={buildExportUrl(code, 'csv')}
        target="_blank"
        rel="noreferrer"
        aria-label={`Export ${code} as CSV`}
      >
        Export CSV
      </a>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-indigo-600 text-white p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">PharmAssist Pro</h1>
          <div className="text-sm">
            {health ? (
              <span className="text-emerald-200">API: {health.status}</span>
            ) : (
              <span className="text-yellow-200">API: unknown</span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-semibold mb-2">Search Diagnoses</h2>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by code, description, or category"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-500"
          />
          {error && <div className="mt-3 text-red-600">{error}</div>}
          {loadingDiag ? (
            <div className="mt-4 text-slate-500">Loading...</div>
          ) : (
            <ul className="mt-4 divide-y border rounded bg-white">
              {diagnoses.length === 0 && <li className="p-3 text-slate-500">No diagnoses found</li>}
              {diagnoses.map(d => (
                <li
                  key={d.code}
                  className={`p-3 hover:bg-slate-50 cursor-pointer ${selected?.code === d.code ? 'bg-indigo-50' : ''}`}
                  onClick={() => setSelected(d)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{d.code} — {d.description}</div>
                      <div className="text-sm text-slate-500">{d.category}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">Select</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Treatments</h2>
          {!selected && <div className="text-slate-500">Select a diagnosis to view treatments</div>}
          {selected && (
            <div className="bg-white rounded border p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{selected.code} — {selected.description}</div>
                  <div className="text-sm text-slate-500">{selected.category}</div>
                </div>
                <ExportButtons code={selected.code} />
              </div>
              {loadingTreatments ? (
                <div className="mt-3 text-slate-500">Loading treatments...</div>
              ) : (
                <ul className="mt-3 space-y-3">
                  {treatments.length === 0 && <li className="text-slate-500">No treatments available</li>}
                  {treatments.map(t => (
                    <li key={t.id} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{t.medication}</div>
                        <span className={`text-xs px-2 py-0.5 rounded ${t.priority === 'high' ? 'bg-red-100 text-red-700' : t.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'}`}>
                          {t.priority}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600">{t.dosage} · {t.duration}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Evidence: {t.evidenceLevel} · Insurance: {t.insuranceCovered ? 'Yes' : 'No'} · Specialist: {t.requiresSpecialist ? 'Yes' : 'No'}
                      </div>
                      {t.sideEffects && <div className="text-xs text-slate-500 mt-1">Side effects: {t.sideEffects}</div>}
                      {t.contraindications && <div className="text-xs text-slate-500">Contraindications: {t.contraindications}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-5xl mx-auto p-4 text-xs text-slate-500">
        API Base: {getApiBase()}
      </footer>
    </div>
  );
}

export default App;
