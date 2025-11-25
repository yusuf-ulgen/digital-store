"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react'; // useEffect'e gerek kalmadı

export default function CategorySidebar({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [minFiyat, setMinFiyat] = useState(searchParams.minFiyat || '');
  const [maxFiyat, setMaxFiyat] = useState(searchParams.maxFiyat || '');
  const stokDurumu = searchParams.stokta || 'hepsi';

  const handleFilterApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams as any);
    
    if (minFiyat) params.set('minFiyat', String(minFiyat));
    else params.delete('minFiyat');

    if (maxFiyat) params.set('maxFiyat', String(maxFiyat));
    else params.delete('maxFiyat');
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStokChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams as any);
    const value = e.target.value;
    
    if (value === 'hepsi') params.delete('stokta');
    else params.set('stokta', value);
    
    // Fiyatları da koru
    if (minFiyat) params.set('minFiyat', String(minFiyat));
    if (maxFiyat) params.set('maxFiyat', String(maxFiyat));

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    // İSTEK 2: Filtre formunu sola yaslamak için 'w-full'
    <form onSubmit={handleFilterApply} className="w-full">
      {/* Stok Durumu Filtresi */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="mb-4 font-semibold text-gray-900">Stok Durumu</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="stok-hepsi"
              name="stokta"
              type="radio"
              value="hepsi"
              checked={stokDurumu === 'hepsi'}
              onChange={handleStokChange}
              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="stok-hepsi" className="ml-3 text-sm text-gray-600">
              Hepsi
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="stok-var"
              name="stokta"
              type="radio"
              value="stokta"
              checked={stokDurumu === 'stokta'}
              onChange={handleStokChange}
              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="stok-var" className="ml-3 text-sm text-gray-600">
              Stokta var
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="stok-yok"
              name="stokta"
              type="radio"
              value="stokta-yok"
              checked={stokDurumu === 'stokta-yok'}
              onChange={handleStokChange}
              className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="stok-yok" className="ml-3 text-sm text-gray-600">
              Stokta yok
            </label>
          </div>
        </div>
      </div>

      {/* Fiyat Filtresi (İSTEK 2: Taşma Düzeltmesi) */}
      <div className="border-b border-gray-200 py-6">
        <h3 className="mb-4 font-semibold text-gray-900">Fiyat</h3>
        {/* Inputları 'flex-1' ve 'min-w-0' ile esnek hale getir */}
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={minFiyat}
            onChange={(e) => setMinFiyat(e.target.value)}
            placeholder="Min"
            className="flex-1 rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-w-0"
            min="0"
          />
          <span className="text-gray-500">–</span>
          <input
            type="number"
            value={maxFiyat}
            onChange={(e) => setMaxFiyat(e.target.value)}
            placeholder="Max"
            className="flex-1 rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-w-0"
            min="0"
          />
        </div>
        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          Uygula
        </button>
      </div>
      
    </form>
  );
}