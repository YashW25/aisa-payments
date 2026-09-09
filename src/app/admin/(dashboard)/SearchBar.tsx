'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { useTransition, useState, useEffect } from 'react';

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  // Update local state if URL changes externally
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center w-full max-w-md">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-[var(--color-aisa-blue)] focus:border-[var(--color-aisa-blue)] block w-full pl-10 p-2.5 outline-none transition-colors"
          placeholder="Search by name, email, transaction ID..."
        />
        <button type="submit" className="hidden" aria-hidden="true" />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="ml-2 px-4 py-2 bg-[var(--color-aisa-blue)] hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        Search
      </button>
    </form>
  );
}
