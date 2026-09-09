'use client';

import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';

export default function DownloadPDFButton({ payments }: { payments: any[] }) {
  const handleDownload = async () => {
    const doc = new jsPDF();
    
    // Add Logo
    const img = new Image();
    img.src = '/LOGO.jpeg'; // Path to logo in public folder
    
    // Wait for image to load
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; // Continue even if image fails to load
    });

    // Add logo to PDF (x, y, width, height)
    // Logo on top left
    doc.addImage(img, 'JPEG', 14, 10, 30, 30);
    
    // Add title in the middle
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('AISA Club Payments Portal', doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
    
    // Add a subtitle or date
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Form Responses - Generated on ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });

    // Table Data
    const tableColumn = ["Date", "Student Info", "Responses", "Payment Status", "Invoice"];
    const tableRows: any[] = [];

    payments.forEach(payment => {
      const customFields = payment.customFields ? payment.customFields : {};
      const hasCustomFields = Object.keys(customFields).length > 0;
      
      let responsesText = "";
      if (hasCustomFields) {
        responsesText = Object.entries(customFields)
          .map(([question, answer]) => `${question}:\n${answer}`)
          .join('\n\n');
      } else {
        responsesText = "No extra questions";
      }

      let studentInfoText = `${payment.name}\n${payment.email}\n`;
      if (payment.prn) studentInfoText += `PRN: ${payment.prn} `;
      if (payment.department) studentInfoText += `• ${payment.department} `;
      if (payment.year) studentInfoText += `• ${payment.year}`;

      const paymentData = [
        new Date(payment.submittedAt).toLocaleDateString(),
        studentInfoText,
        responsesText,
        payment.status,
        payment.id // Store the actual ID instead of "View Invoice"
      ];
      tableRows.push(paymentData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [30, 30, 30],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 50 },
        2: { cellWidth: 60 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 }
      },
      didDrawCell: function (data) {
        // Add hyperlink to "View Invoice" text
        if (data.section === 'body' && data.column.index === 4) {
          const paymentId = data.row.raw[4];
          if (paymentId) {
            // Construct the full URL
            const invoiceUrl = `${window.location.origin}/admin/responses/${paymentId}/invoice`;
            
            doc.setTextColor(0, 102, 204);
            doc.textWithLink('View Invoice', data.cell.x + 4, data.cell.y + 8, { url: invoiceUrl });
          }
        }
      },
      willDrawCell: function (data) {
        // Hide the default text drawn by autoTable for the hyperlink column
        if (data.section === 'body' && data.column.index === 4) {
          data.cell.text = []; // Clear text
        }
      }
    });

    doc.save('form-responses.pdf');
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center px-4 py-2 bg-[var(--color-aisa-blue)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
    >
      <Download className="w-4 h-4 mr-2" />
      Download PDF
    </button>
  );
}
