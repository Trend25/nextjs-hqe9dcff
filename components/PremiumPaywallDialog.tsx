import React from 'react';

// TODO: burada gerçek ödeme akışı tetiklenecek
// TODO: Supabase user.is_premium = true gelirse bu modal hiç açılmayacak

interface PremiumPaywallDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function PremiumPaywallDialog({ open, onClose }: PremiumPaywallDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm max-w-sm w-full mx-auto flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Export investor-ready PDF</h2>
        
        <p className="text-sm text-gray-600">
          Yatırımcıya gönderebileceğin marka logolu raporu PDF olarak indir.
        </p>

        <div className="text-sm text-gray-700 flex flex-col gap-2">
          <div>✓ Detailed valuation breakdown</div>
          <div>✓ VC method section</div>
          <div>✓ Branded layout</div>
        </div>

        <button
          className="rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium disabled:bg-gray-300 w-full"
          disabled
        >
          Upgrade to Premium (yakında)
        </button>

        <button
          onClick={onClose}
          className="text-xs text-gray-500 underline cursor-pointer"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}