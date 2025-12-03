"use client";

import { ChevronUpIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useState } from "react";

type ChatButtonProps = {
  isOpen: boolean;
  onClick: () => void;
};

export default function ChatButton({ isOpen, onClick }: ChatButtonProps) {
  // Resim yüklenemezse metin göstermek için state
  const [imageError, setImageError] = useState(false);

  return (
    <button
      onClick={onClick}
      className={`group relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300 ${
        isOpen ? "bg-stone-900 rotate-90" : "bg-white"
      }`}
    >
      {/* DURUM 1: KAPALI (Logo ve Ok) */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          isOpen ? "opacity-0 invisible" : "opacity-100 visible"
        }`}
      >
        {/* Logo Resmi */}
        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-stone-100">
           {!imageError ? (
             <Image 
               src="/LOGO.png" // DİKKAT: Dosya adın 'logo.png' ise burayı düzelt
               width={40} 
               height={40} 
               alt="Chat Logo" 
               className="h-full w-full object-cover" // object-cover, görseli kırparak alanı doldurur.
               onError={() => setImageError(true)} // Hata olursa metne dön
               unoptimized // Local resimlerde bazen gerekebilir
             />
           ) : (
             // Resim yoksa bu harf görünür
             <span className="text-2xl font-bold text-orange-500 select-none">Ü</span>
           )}
        </div>
        
        {/* Küçük Turuncu Ok İkonu */}
        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white shadow-md ring-2 ring-white">
            <ChevronUpIcon className="h-4 w-4 stroke-[3]" />
        </div>
      </div>

      {/* DURUM 2: AÇIK (X İkonu) */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible -rotate-90" : "opacity-0 invisible"
        }`}
      >
        <XMarkIcon className="h-8 w-8 text-white" />
      </div>
    </button>
  );
}