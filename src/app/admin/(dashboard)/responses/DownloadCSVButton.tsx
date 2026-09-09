'use client';

import React from 'react';
import { Download } from 'lucide-react';

export default function DownloadCSVButton({ payments }: { payments: any[] }) {
  const handleDownload = () => {
    // 1. Collect all unique custom field keys
    const customKeysSet = new Set<string>();
    payments.forEach(payment => {
      if (payment.customFields && typeof payment.customFields === 'object') {
        Object.keys(payment.customFields).forEach(key => customKeysSet.add(key));
      }
    });
    const customKeys = Array.from(customKeysSet);

    // 2. Define headers
    const headers = [
      'Date',
      'Name',
      'Email',
      'Phone',
      'PRN',
      'Department',
      'Year',
      'Amount',
      'Status',
      ...customKeys
    ];

    // 3. Helper to escape CSV cell
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // 4. Build rows
    const rows = payments.map(payment => {
      const row = [
        new Date(payment.submittedAt).toLocaleDateString(),
        payment.name,
        payment.email,
        payment.phone || '',
        payment.prn || '',
        payment.department || '',
        payment.year || '',
        payment.amount || '',
        payment.status,
      ];
      
      customKeys.forEach(key => {
        row.push(payment.customFields?.[key] || '');
      });
      
      return row.map(escapeCsv).join(',');
    });

    // 5. Combine and download
    const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `form-responses-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center px-4 py-2 bg-white/10 text-white border border-white/20 text-sm font-medium rounded-lg hover:bg-white/20 transition-colors"
    >
      <Download className="w-4 h-4 mr-2" />
      Download CSV
    </button>
  );
}
