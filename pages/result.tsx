// pages/result.tsx
import { GetServerSideProps } from 'next';
import Link from 'next/link';

type ResultProps = {
  error?: string;
  startupName?: string;
  sector?: string;
  stage?: string;
  methods?: string[];
  mrr?: number;
  growthRate?: number;
  teamSize?: number;
  compositeScore?: number; // mock
};

const ALLOWED_STAGES = ['idea','mvp','seed','growth'] as const;
const ALLOWED_METHODS = ['berkus','scorecard','riskfactor','vcmethod','dcf'] as const;
type Stage = typeof ALLOWED_STAGES[number];

function parseNumber(v: unknown, {min = 0, max = Number.MAX_SAFE_INTEGER} = {}) {
  const n = typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

export const getServerSideProps: GetServerSideProps<ResultProps> = async ({ query, res }) => {
  const { stage, methods, startupName, sector, mrr, growthRate, teamSize } = query;

  // temel alanlar
  if (!startupName || !sector || !stage || !methods) {
    res.statusCode = 400;
    return { props: { error: 'Eksik parametre(ler). Lütfen sihirbazdan gelin.' } };
  }

  // stage
  const stageStr = String(stage);
  if (!ALLOWED_STAGES.includes(stageStr as Stage)) {
    res.statusCode = 400;
    return { props: { error: 'Geçersiz stage parametresi.' } };
  }

  // methods
  const methodsArr = String(methods)
    .split(',')
    .map(m => m.trim().toLowerCase())
    .filter(m => ALLOWED_METHODS.includes(m as any));
  if (methodsArr.length < 1) {
    res.statusCode = 400;
    return { props: { error: 'Geçersiz yöntem listesi.' } };
  }

  // sayısallar
  const mrrNum        = parseNumber(mrr,        { min: 0 });
  const growthNum     = parseNumber(growthRate, { min: 0, max: 100 });
  const teamSizeNum   = parseNumber(teamSize,   { min: 1, max: 10000 });

  if (mrrNum === null || growthNum === null || teamSizeNum === null) {
    res.statusCode = 400;
    return { props: { error: 'Sayısal parametreler geçersiz.' } };
  }

  // UAT: mock bileşik skor (gerçek motor v0.5 ile gelecekti)
  const compositeScore = Math.round((growthNum/100)*50 + Math.min(50, Math.log10(mrrNum+10)*10));

  return {
    props: {
      startupName: String(startupName),
      sector: String(sector),
      stage: stageStr,
      methods: methodsArr,
      mrr: mrrNum,
      growthRate: growthNum,
      teamSize: teamSizeNum,
      compositeScore
    }
  };
};

export default function ResultPage(props: ResultProps) {
  if (props.error) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Sonuç Özeti (UAT)</h1>
        <p>{props.error}</p>
        <Link href="/evaluate">Değerlendirme sihirbazına dön</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Sonuç Özeti (UAT)</h1>
      <div>Startup: {props.startupName}</div>
      <div>Sektör: {props.sector}</div>
      <div>Aşama: {props.stage}</div>
      <div>Yöntemler: {props.methods?.join(', ')}</div>
      <div>MRR: {props.mrr}</div>
      <div>Büyüme (%): {props.growthRate}</div>
      <div>Takım Büyüklüğü: {props.teamSize}</div>
      <div><b>Bileşik UAT skoru (mock)</b><br/>{props.compositeScore}</div>
      <p><Link href="/evaluate">Geri Dön</Link></p>
    </div>
  );
}
