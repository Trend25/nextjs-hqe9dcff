import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  calcBerkus,
  calcScorecard,
  calcRiskFactor,
  calcVCMethod,
  calcDCF,
  aggregateValuation,
} from '../lib/engine';
import { getSupabaseClient } from '../lib/supabaseClient';
import { recordEvaluationAnalytics } from '../lib/analytics';

type Detail = { method: string; value: number };

export default function ResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [composite, setComposite] = useState<{ min: number; target: number; max: number } | null>(null);
  const [details, setDetails] = useState<Detail[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [analyticsDone, setAnalyticsDone] = useState(false);

  useEffect(() => {
    setLoading(true);
    const q = router.query;
    const stage = typeof q.stage === 'string' ? q.stage : (q.stage && q.stage[0]) || '';
    const methodsStr = typeof q.methods === 'string' ? q.methods : (q.methods && q.methods[0]) || '';
    const methods = methodsStr ? methodsStr.split(',') : [];

    const results: Detail[] = [];

    methods.forEach((m) => {
      if (m === 'berkus') {
        results.push(calcBerkus({ teamQuality: 1, productProgress: 1, marketSize: 1, mvpReady: 1 }));
      }
      if (m === 'scorecard') {
        results.push(calcScorecard({ baseValuation: 1000000, teamScore: 0.2, marketScore: 0.2, productScore: 0.2, competitionScore: 0.2 }));
      }
      if (m === 'riskfactor') {
        results.push(calcRiskFactor({ baseValuation: 1000000, riskAdjustments: [-100000, 50000] }));
      }
      if (m === 'vcmethod') {
        if (stage === 'idea') {
          setErrorMsg('VC Method idea aşamasında kullanılamaz');
        } else {
          results.push(calcVCMethod({ revenueYear5: 5000000, expectedMultiple: 4, dilutionPercent: 20 }));
        }
      }
      if (m === 'dcf') {
        results.push(calcDCF({ cashflows: [100000, 120000, 150000], discountRate: 0.1 }));
      }
    });

    const comp = aggregateValuation(results);
  setDetails(results);
  setComposite(comp);
  setLoading(false);

    // TODO: PDF export sadece ücretli planda aktif olacak
    // TODO: Partner dashboard için bu sonucu org_id altında raporla
    // TODO: Admin dashboard bu sonucu aggregate olarak görebilmeli
    // TODO: analytics_evaluations tablosuna anonim olarak yaz (consent_flag kontrolü ile)
  }, [router.query]);

  // When composite is available, send a best-effort analytics event to staging
  useEffect(() => {
    if (!composite) return;
    if (analyticsDone) return;

    const q = router.query;
    const stageFromQuery = typeof q.stage === 'string' ? q.stage : (q.stage && q.stage[0]) || '';

    const payload = {
      org_id: q.org_id ? (Array.isArray(q.org_id) ? String(q.org_id[0]) : String(q.org_id)) : null,
      stage: stageFromQuery,
      sector: q.sector ? (Array.isArray(q.sector) ? String(q.sector[0]) : String(q.sector)) : null,
      composite_min: composite.min,
      composite_target: composite.target,
      composite_max: composite.max,
      consent_flag: q.consent === '1' ? true : false,
    };

    // TODO: consent_flag === false ise partner dashboard'da bu sonuç görünmemeli
    // TODO: Admin dashboard total evaluation count bu tablodan gelecek
    // TODO: Production ortamında bu insert backend API route üzerinden yapılacak (doğrudan client değil)

    try {
      const supabase = getSupabaseClient();
      // NOTE: This may return null if env not configured (staging-only). Do not throw.
      // TODO: Production keys must NOT be used here.
      // Best-effort call; do not block UI.
      recordEvaluationAnalytics(supabase, payload).finally(() => {
        setAnalyticsDone(true);
      });
    } catch (e) {
      // swallow any sync errors
      setAnalyticsDone(true);
    }
  }, [composite, analyticsDone, router.query]);

  return (
    <div className="min-h-screen p-4 bg-gray-50 flex items-start justify-center">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm max-w-md w-full mx-auto flex flex-col gap-4">
        <h1 className="text-lg font-semibold text-gray-900">Değerleme Sonucu</h1>

        {loading && <div className="text-sm text-gray-500">Hesaplanıyor...</div>}

        {errorMsg && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-md p-2 text-sm">{errorMsg}</div>
        )}

        {composite && (
          <div className="rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 p-3 text-sm">
            <div className="font-medium">Tahmini Değerleme Aralığı (USD)</div>
            <div>Min: {composite.min.toLocaleString()}</div>
            <div>Hedef: {composite.target.toLocaleString()}</div>
            <div>Maksimum: {composite.max.toLocaleString()}</div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {details.map((row) => (
            <div key={row.method} className="text-sm text-gray-700 flex justify-between">
              <span>{row.method}</span>
              <span className="font-medium">${row.value.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <button className="rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium w-full disabled:bg-gray-300" disabled>
          PDF indir (Premium)
        </button>

        {analyticsDone && (
          <div className="text-[10px] text-gray-400">analytics recorded (staging)</div>
        )}
      </div>
    </div>
  );
}
