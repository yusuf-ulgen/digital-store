import Image from "next/image";

export default function HeroPromo() {
  return (
    <section className="relative w-full overflow-hidden bg-[var(--bg)]">
      {/* Arkaplan foto */}
      <div className="relative h-[360px] md:h-[420px]">
        <Image
          src="/hero-bg.jpg"
          alt="Arkaplan"
          fill
          priority
          className="object-cover"
        />
        {/* Hafif karartma */}
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* İçerik katmanı */}
      <div className="pointer-events-none absolute inset-0">
        <div className="max-w-screen-2xl mx-auto h-full px-4 flex items-center">
          {/* Kırmızı kapsül */}
          <div className="pointer-events-auto">
            <div className="inline-flex rounded-2xl bg-red-600/95 text-white px-6 md:px-10 py-5 md:py-6 shadow-lg">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-extrabold tracking-wide">
                  TÜM ÜRÜNLERDE GEÇERLİ
                </div>
                <div className="text-2xl md:text-4xl font-extrabold mt-1">
                  2. ÜRÜN %50 İNDİRİMLİ
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sağdaki şef */}
        <div className="absolute right-4 bottom-0 h-[85%] md:right-12">
          <Image
            src="/chef.png"
            alt="Şef"
            width={380}
            height={520}
            className="h-full w-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
          />
        </div>
      </div>
    </section>
  );
}
