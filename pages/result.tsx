// pages/result.tsx
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';

type Parsed = {
  stage: string;
  methods: string[];
  startupName: string;
  sector: string;
  mrr: string;
  growthRate: string;
  teamSize: string;
};

function parseQuery(q: Record<string, any>): Parsed {
  const methods = typeof q.methods === 'string' ? q.methods.split(',').filter(Boolean) : [];
  return {
    stage: (q.stage as string) || '',
    methods,
    startupName: (q.startupName as string) || '',
    sector: (q.sector as string) || '',
    mrr: (q.mrr as string) || '',
    growthRate: (q.growthRate as string) || '',
    teamSize: (q.teamSize as string) || '',
  };
}

// UAT basit bileşik skor (sadece görsel amaçlı, gerçek motor değil)
function mockCompositeScore(p: Parsed): number {
  let base = 50;
  if (p.stage === 'mvp') base += 5;
  if (p.stage === 'seed') base += 10;
  if (p.stage === 'growth') base += 15;
  base += Math.min(p.methods.length * 3, 12);
  return Math.max(0, Math.min(100, base));
}

export default function ResultPage() {
  const router = useRouter();

  const data = useMemo(() => parseQuery(router.query), [router.query]);
  const score = useMemo(() => mockCompositeScore(data), [data]);

  return (
    <div className="min-h-screen p-4 bg-gray-50 flex items-start justify-center">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm max-w-xl w-full mx-auto flex flex-col gap-4">
        <h1 className="text-lg font-semibold text-gray-900">Sonuç Özeti (UAT)</h1>

        {!data.startupName || !data.sector ? (
          <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md p-3 text-sm">
            Eksik parametreler var. Lütfen değerlendirme sihirbazından gelin.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Startup</div>
                <div className="font-medium">{data.startupName}</div>
              </div>
              <div>
                <div className="text-gray-500">Sektör</div>
                <div className="font-medium">{data.sector}</div>
              </div>
              <div>
                <div className="text-gray-500">Aşama</div>
                <div className="font-medium capitalize">{data.stage || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Yöntemler</div>
                <div className="font-medium">{data.methods.join(', ') || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">MRR</div>
                <div className="font-medium">{data.mrr || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Büyüme (%)</div>
                <div className="font-medium">{data.growthRate || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Takım Büyüklüğü</div>
                <div className="font-medium">{data.teamSize || '-'}</div>
              </div>
            </div>

            <div className="mt-2">
              <div className="text-gray-500 text-sm">Bileşik UAT skoru (mock)</div>
              <div className="text-3xl font-bold">{score}</div>
            </div>

            <div className="flex gap-2">
              <button
                className="rounded-md border border-gray-300 text-gray-700 bg-white px-4 py-2 text-sm"
                onClick={() => router.push('/evaluate')}
              >
                Geri Dön
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
