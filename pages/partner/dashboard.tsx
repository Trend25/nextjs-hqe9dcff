import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSupabaseClient } from '../../lib/supabaseClient';
import { fetchPartnerAnalytics } from '../../lib/partnerAnalytics';

export default function PartnerDashboardPage() {
  const router = useRouter();
  const q = router.query;
  const queryOrg = typeof q.org_id === 'string' ? q.org_id : (Array.isArray(q.org_id) ? String(q.org_id[0]) : undefined);

  const [orgId, setOrgId] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // prefer query param, fallback to localStorage (mock)
    if (queryOrg) {
      setOrgId(queryOrg);
    } else if (typeof window !== 'undefined') {
      const fromLs = localStorage.getItem('org_id');
      setOrgId(fromLs || null);
    }
  }, [queryOrg]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErrorMsg(null);

      if (!orgId) {
        setErrorMsg('Org ID bulunamadı');
        setLoading(false);
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        setErrorMsg('Veri alınamadı (staging offline)');
        setLoading(false);
        return;
      }

      const res = await fetchPartnerAnalytics(supabase, orgId);
      if (!mounted) return;

      if (res.error) {
        setErrorMsg('Veri alınamadı (staging offline)');
        setData([]);
      } else {
        setData(res.data || []);
      }

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [orgId]);

  return (
    <div className="min-h-screen p-4 bg-gray-50 flex items-start justify-center">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm max-w-3xl w-full mx-auto flex flex-col gap-4">
        <h1 className="text-lg font-semibold text-gray-900">Partner Dashboard</h1>

        {/* TODO: RLS prod ortamında aktif olacak (org_id → user token) */}
        {/* TODO: Admin dashboard aggregate veriyi bu tablodan okuyacak */}
        {/* TODO: Partner auth eklendiğinde org_id router parametresinden değil token'dan alınacak */}
        {/* TODO: Staging Supabase dışında hiçbir ortamda bu query çalışmamalı */}

        {loading && <div className="text-sm text-gray-500">Veri yükleniyor...</div>}

        {errorMsg && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-md p-2 text-sm">{errorMsg}</div>
        )}

        {!loading && !errorMsg && data.length === 0 && (
          <div className="text-sm text-gray-600">Henüz analiz veriniz yok.</div>
        )}

        {!loading && !errorMsg && data.length > 0 && (
          <table className="w-full text-sm border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-2 py-1 text-left">Stage</th>
                <th className="border px-2 py-1 text-left">Sector</th>
                <th className="border px-2 py-1 text-left">Target (USD)</th>
                <th className="border px-2 py-1 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{row.stage}</td>
                  <td className="border px-2 py-1">{row.sector}</td>
                  <td className="border px-2 py-1">{row.composite_target?.toLocaleString?.() ?? row.composite_target}</td>
                  <td className="border px-2 py-1">{new Date(row.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
