"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const MOCK_BRANDS = [
  "Ülgen Paslanmaz",
  "Ocakoğlu",
  "Sürbisa",
  "Victorinox",
  "F.Dick"
];

export default function CategorySidebar({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [minFiyat, setMinFiyat] = useState(searchParams.minFiyat || '');
  const [maxFiyat, setMaxFiyat] = useState(searchParams.maxFiyat || '');
  const stokDurumu = searchParams.stokta || 'hepsi';
  
  // Markalar searchParams'tan alınabilir (birden çok marka seçilebilir)
  const currentBrandsParam = searchParams.marka;
  const initialBrands = Array.isArray(currentBrandsParam) 
    ? currentBrandsParam 
    : typeof currentBrandsParam === 'string' 
      ? [currentBrandsParam] 
      : [];
      
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrands);

  const applyFilters = (newBrands: string[], newStock: string, newMin: string, newMax: string) => {
    const params = new URLSearchParams(searchParams as any);
    
    // Fiyat
    if (newMin) params.set('minFiyat', String(newMin));
    else params.delete('minFiyat');

    if (newMax) params.set('maxFiyat', String(newMax));
    else params.delete('maxFiyat');

    // Stok
    if (newStock === 'hepsi') params.delete('stokta');
    else params.set('stokta', newStock);

    // Markalar
    params.delete('marka');
    newBrands.forEach(b => params.append('marka', b));

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilterApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(selectedBrands, stokDurumu as string, minFiyat as string, maxFiyat as string);
  };

  const handleStokChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    applyFilters(selectedBrands, value, minFiyat as string, maxFiyat as string);
  };

  const handleBrandChange = (brand: string, isChecked: boolean) => {
    const newBrands = isChecked 
      ? [...selectedBrands, brand] 
      : selectedBrands.filter(b => b !== brand);
      
    setSelectedBrands(newBrands);
    // Marka seçilir seçilmez uygulayalım
    applyFilters(newBrands, stokDurumu as string, minFiyat as string, maxFiyat as string);
  };

  return (
    <form onSubmit={handleFilterApply} className="w-full space-y-6">
      
      {/* Marka Filtresi */}
      <div className="filter-section">
        <h3 className="filter-title">Marka / Üretici</h3>
        <div className="space-y-3">
          {MOCK_BRANDS.map(brand => (
            <div key={brand} className="flex items-center group">
              <input
                id={`brand-${brand}`}
                name="marka"
                type="checkbox"
                value={brand}
                checked={selectedBrands.includes(brand)}
                onChange={(e) => handleBrandChange(brand, e.target.checked)}
                className="filter-checkbox border-stone-300 rounded-sm text-stone-900 focus:ring-stone-900"
              />
              <label htmlFor={`brand-${brand}`} className="ml-3 text-sm text-stone-600 group-hover:text-stone-900 cursor-pointer transition-colors">
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Stok Durumu Filtresi */}
      <div className="filter-section">
        <h3 className="filter-title">Stok Durumu</h3>
        <div className="space-y-3">
          <div className="flex items-center group">
            <input
              id="stok-hepsi"
              name="stokta"
              type="radio"
              value="hepsi"
              checked={stokDurumu === 'hepsi'}
              onChange={handleStokChange}
              className="filter-radio border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <label htmlFor="stok-hepsi" className="ml-3 text-sm text-stone-600 group-hover:text-stone-900 cursor-pointer transition-colors">
              Tümü
            </label>
          </div>
          <div className="flex items-center group">
            <input
              id="stok-var"
              name="stokta"
              type="radio"
              value="stokta"
              checked={stokDurumu === 'stokta'}
              onChange={handleStokChange}
              className="filter-radio border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <label htmlFor="stok-var" className="ml-3 text-sm text-stone-600 group-hover:text-stone-900 cursor-pointer transition-colors">
              Stokta Var
            </label>
          </div>
        </div>
      </div>

      {/* Fiyat Filtresi */}
      <div className="filter-section border-b-0 pb-0 mb-0">
        <h3 className="filter-title">Fiyat Aralığı</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={minFiyat}
            onChange={(e) => setMinFiyat(e.target.value)}
            placeholder="Min"
            className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 min-w-0 outline-none transition-all"
            min="0"
          />
          <span className="text-stone-400">–</span>
          <input
            type="number"
            value={maxFiyat}
            onChange={(e) => setMaxFiyat(e.target.value)}
            placeholder="Max"
            className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 min-w-0 outline-none transition-all"
            min="0"
          />
        </div>
        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-stone-800 transition-colors"
        >
          Fiyatı Uygula
        </button>
      </div>
      
    </form>
  );
}