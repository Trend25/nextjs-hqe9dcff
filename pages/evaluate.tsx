import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
//import { saveDraftEvaluation, loadLastDraft } from '../lib/supabaseClient';
import { loadLastDraft } from '../lib/supabaseClient';
// UAT build: saveDraftEvaluation kaldırıldı (v0.5 kapsamı)
type StatusMsg = { type: 'error' | 'success' | null; text: string };

export default function EvaluatePage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [stage, setStage] = useState<string>('');
  const [methods, setMethods] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    startupName: '',
    sector: '',
    mrr: '',
    growthRate: '',
    teamSize: '',
  });
  const [statusMsg, setStatusMsg] = useState<StatusMsg>({ type: null, text: '' });

  useEffect(() => {
    let mounted = true;
    loadLastDraft()
      .then((d) => {
        if (!mounted) return;
        if (d) {
          setStage(d.stage);
          setMethods(d.methods || []);
          setFormData({ ...formData, ...d.formData });
          setStatusMsg({ type: 'success', text: 'Taslak yüklendi' });
        }
      })
      .catch(() => {
        // ignore in mock
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stages = ['idea', 'mvp', 'seed', 'growth'];
  const availableMethods = ['berkus', 'scorecard', 'riskfactor', 'vcmethod', 'dcf'];

  const handleToggleMethod = (m: string) => {
    // Rule: if stage === 'idea' then vcmethod cannot be selected
    if (m === 'vcmethod' && stage === 'idea') {
      setStatusMsg({ type: 'error', text: 'vcmethod idea aşamasında kullanılamaz' });
      return;
    }

    setStatusMsg({ type: null, text: '' });
    setMethods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const handleSaveDraft = async () => {
    setStatusMsg({ type: null, text: '' });
    const payload = {
      stage,
      methods,
      formData,
      user_id: 'TODO-user', // TODO: org_id bilgisini kullanıcı oturumundan bağla
      org_id: 'TODO-org', // TODO: org_id bilgisini kullanıcı oturumundan bağla
      created_at: new Date().toISOString(),
      engine_version: 'v1', // TODO: engine_version değişirse yeniden skor hesapla
    };

    try {
      // UAT build: saveDraftEvaluation devre dışı (v0.5 sonrası geri alınacak)
    console.warn('UAT build: saveDraftEvaluation() disabled. Payload:', payload);
    setStatusMsg({ type: 'success', text: 'Taslak kaydetme UAT build’de devre dışı.' });
// TODO(v0.5): saveDraftEvaluation(payload) geri eklenecek.
    } catch (e) {
      setStatusMsg({ type: 'error', text: 'Kaydederken hata oluştu' });
    }
  };

  const handleCalculate = () => {
    // TODO: consent_flag=false ise analytics'e yazma
    const qs = `?stage=${encodeURIComponent(stage)}&methods=${encodeURIComponent(
      methods.join(','),
    )}&startupName=${encodeURIComponent(formData.startupName)}&sector=${encodeURIComponent(
      formData.sector,
    )}&mrr=${encodeURIComponent(formData.mrr)}&growthRate=${encodeURIComponent(
      formData.growthRate,
    )}&teamSize=${encodeURIComponent(formData.teamSize)}`;

    router.push(`/result${qs}`);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 flex items-start justify-center">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm max-w-md w-full mx-auto flex flex-col gap-4">
        <h1 className="text-lg font-semibold text-gray-900">Değerlendirme Sihirbazı</h1>
        <p className="text-sm text-gray-600">Aşama {step} / 3</p>

        {statusMsg.type === 'error' && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-md p-2 text-sm">
            {statusMsg.text}
          </div>
        )}
        {statusMsg.type === 'success' && (
          <div className="bg-green-50 text-green-700 border border-green-200 rounded-md p-2 text-sm">
            {statusMsg.text}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-3">
            <div className="text-sm text-gray-600">Aşama seçiniz</div>
            <div className="flex flex-col gap-2">
              {stages.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="stage"
                    value={s}
                    checked={stage === s}
                    onChange={() => setStage(s)}
                  />
                  <span className="capitalize">{s}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium disabled:bg-gray-300"
                onClick={() => setStep(2)}
                disabled={!stage}
              >
                Devam
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <div className="text-sm text-gray-600">Yöntemleri seçiniz (en az 2)</div>
            <div className="flex flex-col gap-2">
              {availableMethods.map((m) => {
                const disabled = m === 'vcmethod' && stage === 'idea';
                return (
                  <label key={m} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="methods"
                      value={m}
                      checked={methods.includes(m)}
                      onChange={() => handleToggleMethod(m)}
                      disabled={disabled}
                    />
                    <span className="lowercase">{m}</span>
                    {disabled && (
                      <small className="text-red-600 text-xs ml-2">idea aşamasında kullanılamaz</small>
                    )}
                  </label>
                );
              })}
            </div>

            <div className="flex justify-between gap-2">
              <button
                className="rounded-md border border-gray-300 text-gray-700 bg-white px-4 py-2 text-sm font-medium"
                onClick={() => setStep(1)}
              >
                Geri
              </button>
              <button
                className="rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium disabled:bg-gray-300"
                onClick={() => setStep(3)}
                disabled={methods.length < 2}
              >
                Devam
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3">
            <div className="text-sm text-gray-600">Form bilgileri</div>

            <label className="text-sm">
              <div className="text-sm text-gray-600">Startup İsmi</div>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={formData.startupName}
                onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
              />
            </label>

            <label className="text-sm">
              <div className="text-sm text-gray-600">Sektör</div>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              />
            </label>

            <label className="text-sm">
              <div className="text-sm text-gray-600">MRR</div>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                type="number"
                value={formData.mrr}
                onChange={(e) => setFormData({ ...formData, mrr: e.target.value })}
              />
            </label>

            <label className="text-sm">
              <div className="text-sm text-gray-600">Growth Rate (%)</div>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                type="number"
                value={formData.growthRate}
                onChange={(e) => setFormData({ ...formData, growthRate: e.target.value })}
              />
            </label>

            <label className="text-sm">
              <div className="text-sm text-gray-600">Team Size</div>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                type="number"
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
              />
            </label>

            <div className="flex justify-between gap-2">
              <button
                className="rounded-md border border-gray-300 text-gray-700 bg-white px-4 py-2 text-sm font-medium"
                onClick={() => setStep(2)}
              >
                Geri
              </button>

              <div className="flex gap-2">
                <button
                  className="rounded-md border border-gray-300 text-gray-700 bg-white px-4 py-2 text-sm font-medium"
                  onClick={handleSaveDraft}
                >
                  Taslağı Kaydet
                </button>
                <button
                  className="rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium disabled:bg-gray-300"
                  onClick={handleCalculate}
                  disabled={!formData.startupName || !formData.sector}
                >
                  Hesapla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
