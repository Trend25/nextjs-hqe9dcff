import React from 'react';

// TODO: Bu rapor partner dashboard (org_id bazlı) altında gösterilecek
// TODO: Admin dashboard bu verileri aggregate olarak görebilmeli
// TODO: consent_flag === false ise hiçbir analitik yazılmayacak

interface ResultReportProps {
  stage: string;
  selectedMethods: string[];
  valuations: Record<string, number>;
  compositeValuation: {
    min: number;
    target: number;
    max: number;
  };
  founderEmail?: string | null;
  startupName?: string | null;
  generatedAt: Date;
}

export default function ResultReport({
  stage,
  selectedMethods,
  valuations,
  compositeValuation,
  founderEmail,
  startupName,
  generatedAt,
}: ResultReportProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm max-w-md w-full mx-auto flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-gray-900">Değerleme Sonucu</h1>

      <div className="text-xs text-gray-500">
        Startup: {startupName || "N/A"} · {generatedAt.toLocaleDateString()} · Aşama: {stage}
      </div>

      <div className="rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 p-3 text-sm">
        <div className="font-medium">Tahmini Değerleme Aralığı (USD)</div>
        <div>Min: {compositeValuation.min.toLocaleString()}</div>
        <div>Hedef: {compositeValuation.target.toLocaleString()}</div>
        <div>Maksimum: {compositeValuation.max.toLocaleString()}</div>
      </div>

      <div className="flex flex-col gap-2">
        {selectedMethods.map((methodName) => (
          <div key={methodName} className="text-sm text-gray-700 flex justify-between">
            <span>{methodName}</span>
            <span className="font-medium">
              ${valuations[methodName]?.toLocaleString?.() ?? "-"}
            </span>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-gray-400">
        Bu çıktı finansal tavsiye değildir. Deneysel tahmin amaçlıdır.
      </div>
    </div>
  );
}