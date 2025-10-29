import React, { useState } from 'react';
import PremiumPaywallDialog from './PremiumPaywallDialog';

// TODO: PDF export sadece ücretli planda aktif olacak (gerçek premium kontrolü Supabase'den gelecek)
// TODO: partner org'larına whitelabel logo ekle (stage: partner dashboard)

interface ExportPdfButtonProps {
  isPremium: boolean;
}

export default function ExportPdfButton({ isPremium }: ExportPdfButtonProps) {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <div className="print:hidden w-full">
      <button
        onClick={() => {
          if (isPremium) {
            window.print();
          } else {
            setShowPaywall(true);
          }
        }}
        className="rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium w-full disabled:bg-gray-300"
      >
        PDF indir
      </button>

      <PremiumPaywallDialog 
        open={showPaywall} 
        onClose={() => setShowPaywall(false)} 
      />
    </div>
  );
}