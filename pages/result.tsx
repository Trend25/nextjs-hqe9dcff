// pages/result.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { parseResultQuery } from "../lib/validation";
import {
  BaseInput,
  ValuationMethod,
} from "../lib/score-engine/types";
import { evaluateStartupWithDefaults } from "../lib/score-engine";

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; messages: string[] }
  | {
      kind: "success";
      composite: number;
      methods: {
        name: string;
        value: number;
      }[];
      input: BaseInput;
    };

export default function ResultPage() {
  const router = useRouter();
  const [state, setState] = useState<ViewState>({ kind: "loading" });

  useEffect(() => {
    // query hazır değilse bekle
    if (!router.isReady) return;

    const parseRes = parseResultQuery(router.query);

    if (!parseRes.ok) {
      setState({
        kind: "error",
        messages:
          parseRes.errors.length > 0
            ? parseRes.errors
            : ["Eksik veya geçersiz parametreler var."],
      });
      return;
    }

    const data = parseRes.data;

    // methods string → ValuationMethod[]
    const methods = data.methods
      .map((m) => m.trim())
      .filter(Boolean) as ValuationMethod[];

    if (methods.length === 0) {
      setState({
        kind: "error",
        messages: ["En az bir değerleme yöntemi seçilmelidir."],
      });
      return;
    }

    const input: BaseInput = {
      stage: data.stage,
      startupName: data.startupName,
      sector: data.sector,
      mrr: data.mrr,
      growthRate: data.growthRate,
      teamSize: data.teamSize,
      //methods, // istersen burada da saklayabilirsin
    };

    // Score engine çağrısı – ayrı handleCalculate yok,
    // sayfa yüklendiğinde (query hazır olunca) çalışıyor
    const result = evaluateStartupWithDefaults(input, methods);

    setState({
      kind: "success",
      composite: result.compositeValue ?? 0,
      methods: result.methods.map((m) => ({
        name: m.method,
        value: m.value,
      })),
      input,
    });
  }, [router.isReady, router.query]);

  const handleBack = () => {
    router.push("/evaluate");
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 flex items-start justify-center">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm max-w-xl w-full mx-auto flex flex-col gap-4">
        <h1 className="text-lg font-semibold text-gray-900">Sonuç Özeti (UAT)</h1>

        {state.kind === "loading" && (
          <div className="bg-blue-50 text-blue-800 border border-blue-200 rounded-md p-3 text-sm">
            Değerleme hesaplanıyor...
          </div>
        )}

        {state.kind === "error" && (
          <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md p-3 text-sm">
            <p className="font-medium mb-1">
              Eksik veya geçersiz parametreler var. Lütfen değerlendirme
              sihirbazından gelin.
            </p>
            <ul className="list-disc list-inside text-xs mt-1">
              {state.messages.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
            <button
              className="mt-3 rounded-md border border-gray-300 text-gray-700 bg-white px-3 py-1.5 text-xs font-medium"
              onClick={handleBack}
            >
              Değerlendirme Sihirbazına Dön
            </button>
          </div>
        )}

        {state.kind === "success" && (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500 text-xs">Startup</div>
                <div className="text-gray-900 font-medium">
                  {state.input.startupName}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Sektör</div>
                <div className="text-gray-900 font-medium">
                  {state.input.sector}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Aşama</div>
                <div className="text-gray-900 font-medium uppercase">
                  {state.input.stage}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Takım Büyüklüğü</div>
                <div className="text-gray-900 font-medium">
                  {state.input.teamSize ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">MRR</div>
                <div className="text-gray-900 font-medium">
                  {state.input.mrr != null ? `${state.input.mrr}` : "—"}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Growth Rate (%)</div>
                <div className="text-gray-900 font-medium">
                  {state.input.growthRate != null
                    ? `${state.input.growthRate}%`
                    : "—"}
                </div>
              </div>
            </div>

            <div className="mt-2 p-3 rounded-md bg-indigo-50 border border-indigo-200">
              <div className="text-xs text-indigo-700 mb-1">
                Bileşik Tahmini Değerleme (v0.5 UAT, mock)
              </div>
              <div className="text-lg font-semibold text-indigo-900">
                {state.composite.toLocaleString("tr-TR", {
                  maximumFractionDigits: 0,
                })}{" "}
                ₺
              </div>
            </div>

            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">
                Yöntem Bazında Tahminler
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {state.methods.map((m) => (
                  <div
                    key={m.name}
                    className="rounded-md border border-gray-200 p-2 flex flex-col gap-1"
                  >
                    <div className="text-xs uppercase text-gray-500">
                      {m.name}
                    </div>
                    <div className="text-gray-900 font-medium">
                      {m.value.toLocaleString("tr-TR", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      ₺
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-3">
              <button
                className="rounded-md border border-gray-300 text-gray-700 bg-white px-4 py-2 text-sm font-medium"
                onClick={handleBack}
              >
                Yeni Değerlendirme Yap
              </button>
            </div>

            <div className="text-[10px] text-gray-400 mt-1">
              UAT build: Score engine v0.5 (parametrik yapı, mock değerler). Bu
              ekran production finansal tavsiye değildir.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
