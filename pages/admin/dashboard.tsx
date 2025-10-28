// NOT: This ekran staging/preview için. Production domain (ratemystartup.info) altında yayınlanmayacak.
// TODO: Bu route ileride protected olacak (Admin User login zorunlu).
// TODO: Abuse takibi (şüpheli kullanım) burada görünecek ama şu anda sadece TODO.

import React, { useEffect, useState } from 'react';
import { getMockSession } from '../../lib/authGate';
import type { AdminSummary } from '../../lib/adminSummary';

export default function AdminDashboard(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [summary, setSummary] = useState<AdminSummary | null>(null);

  useEffect(() => {
    // Double protection: component seviyesinde de auth kontrolü
    const session = getMockSession();
    if (session.role !== "admin") {
      setErrorMsg("Erişim reddedildi: sadece admin kullanıcılar için.");
      setLoading(false);
      return;
    }

    async function fetchSummary() {
      try {
        const response = await fetch("/api/admin/summary");
        
        if (response.status === 403) {
          setErrorMsg("Erişim reddedildi: sadece admin kullanıcılar için.");
          setLoading(false);
          return;
        }

        const json = await response.json();
        
        if (json.warning === "staging offline") {
          setErrorMsg("Veri alınamadı (staging offline)");
        } else if (json.summary) {
          setSummary(json.summary);
        }
        
        setLoading(false);
      } catch (error) {
        console.warn('Error fetching admin summary:', error);
        setErrorMsg("Veri alınamadı (staging offline)");
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm max-w-md w-full mx-auto flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>

      {loading && <div className="text-sm text-gray-500">Veri yükleniyor...</div>}

      {errorMsg && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-md p-2 text-sm">{errorMsg}</div>
      )}

      {summary && (
        <div className="flex flex-col gap-4">
          <div className="rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 p-3 text-sm">
            <div className="font-medium">Toplam Değerlendirme</div>
            <div>{summary.totalEvaluations.toLocaleString()}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-900 mb-1">En Popüler Stage'ler</div>
            <table className="w-full text-sm border-collapse border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-2 py-1 text-left">Stage</th>
                  <th className="border px-2 py-1 text-left">Count</th>
                </tr>
              </thead>
              <tbody>
                {summary.topStages.map((row, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{row.stage ?? 'unknown'}</td>
                    <td className="border px-2 py-1">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-900 mb-1">En Aktif Organizasyonlar</div>
            <table className="w-full text-sm border-collapse border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-2 py-1 text-left">Org</th>
                  <th className="border px-2 py-1 text-left">Count</th>
                </tr>
              </thead>
              <tbody>
                {summary.topOrgs.map((row, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{row.org_id ?? 'unknown'}</td>
                    <td className="border px-2 py-1">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-[10px] text-gray-400">staging admin view — production'a deploy ETME</div>
    </div>
  );
}
