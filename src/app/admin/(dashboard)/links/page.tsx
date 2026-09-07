import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Plus, Link as LinkIcon, ExternalLink, Settings } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PaymentLinksList() {
  const links = await prisma.paymentLink.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { payments: true }
      }
    }
  });

  return (
    <div className="space-y-6 text-[var(--color-aisa-text)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Payment Links</h1>
          <p className="text-sm text-gray-400">Manage all AISA collection links</p>
        </div>
        <Link href="/admin/links/new" 
          className="flex items-center px-4 py-2 bg-[var(--color-aisa-blue)] hover:bg-blue-500 text-white font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4 mr-2" /> New Link
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {links.map((link) => (
          <div key={link.id} className="bg-black/20 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all flex flex-col">
            <div className="p-5 border-b border-white/10 flex-1">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg line-clamp-1" title={link.title}>{link.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${link.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  {link.isActive ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
              <p className="text-xl font-bold text-[var(--color-aisa-gold)] mb-4">₹{link.amount.toString()}</p>
              
              <div className="flex items-center text-sm text-gray-400 bg-black/30 p-2 rounded truncate mb-4">
                <LinkIcon className="w-3.5 h-3.5 mr-2 shrink-0" />
                <span className="truncate">/pay/{link.slug}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Collected</span>
                <span className="font-medium text-white">{link._count.payments} payments</span>
              </div>
            </div>
            
            <div className="bg-white/5 p-3 flex divide-x divide-white/10">
              <Link href={`/pay/${link.slug}`} target="_blank" className="flex-1 flex justify-center items-center text-sm text-[var(--color-aisa-blue)] hover:text-white transition-colors py-1">
                <ExternalLink className="w-4 h-4 mr-1.5" /> View
              </Link>
              <Link href={`/admin/links/${link.id}`} className="flex-1 flex justify-center items-center text-sm text-gray-400 hover:text-white transition-colors py-1">
                <Settings className="w-4 h-4 mr-1.5" /> Manage
              </Link>
            </div>
          </div>
        ))}

        {links.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-black/20 border border-white/10 border-dashed rounded-xl">
            <LinkIcon className="w-12 h-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium mb-1">No payment links yet</h3>
            <p className="text-gray-400 text-sm mb-4">Create your first link to start collecting payments.</p>
            <Link href="/admin/links/new" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
              Create Payment Link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
