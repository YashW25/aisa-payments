'use client';

import { Download } from 'lucide-react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="mt-8 flex items-center space-x-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors print:hidden shadow-lg"
    >
      <Download className="w-5 h-5" />
      <span>Download PDF (Print)</span>
    </button>
  );
}
