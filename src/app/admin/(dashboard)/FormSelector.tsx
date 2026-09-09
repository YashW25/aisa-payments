'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function FormSelector({ links }: { links: { id: string; title: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentLinkId = searchParams.get('linkId') || '';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      router.push(`${pathname}?linkId=${val}`);
    } else {
      router.push(pathname);
    }
  };

  return (
    <div className="mb-6 flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/10">
      <label htmlFor="formSelect" className="text-sm font-medium text-gray-300">
        Select Form:
      </label>
      <select
        id="formSelect"
        value={currentLinkId}
        onChange={handleChange}
        className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-[var(--color-aisa-blue)] min-w-[250px]"
      >
        <option value="">-- Select a Form --</option>
        {links.map((link) => (
          <option key={link.id} value={link.id}>
            {link.title}
          </option>
        ))}
      </select>
    </div>
  );
}
