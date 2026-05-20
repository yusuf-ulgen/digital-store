"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw
} from "lucide-react";

export default function Footer() {
  const [clicks, setClicks] = useState(0);
  const [showEgg, setShowEgg] = useState(false);

  const handleLogoClick = () => {
    const n = clicks + 1;
    setClicks(n);
    if (n === 5) {
      setShowEgg(true);
      setTimeout(() => {
        setShowEgg(false);
        setClicks(0);
      }, 4000);
    }
  };

  const footerLinks = {
    kurumsal: [
      { name: "Hakkımızda", href: "#" },
      { name: "İletişim", href: "#" },
      { name: "Kargo Süreci", href: "#" },
      { name: "İade / Değişim", href: "#" },
    ],
    sozlesmeler: [
      { name: "Mesafeli Satış Sözleşmesi", href: "#" },
      { name: "Gizlilik Politikası", href: "#" },
      { name: "KVKK Aydınlatma Metni", href: "#" },
      { name: "Çerez Politikası", href: "#" },
    ],
    kategoriler: [
      { name: "Meyve Bıçakları", href: "/products?cat=meyve" },
      { name: "Sebze Bıçakları", href: "/products?cat=sebze" },
      { name: "Kasap Bıçakları", href: "/products?cat=kasap" },
      { name: "Bıçak Setleri", href: "/products?cat=bicak-seti" },
      { name: "Bileyiciler", href: "/products?cat=bileyici-masat" },
    ]
  };

  return (
    <footer className="bg-[#0A0A0A] text-white pt-10 pb-6 border-t border-white/5">
      {/* Easter Egg Popup */}
      {showEgg && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 border-2 border-blue-500 rounded-2xl p-8 z-[9999] text-center shadow-[0_0_50px_rgba(59,130,246,0.3)] animate-in zoom-in duration-300">
          <div className="text-4xl mb-4 text-blue-400">🔪✨</div>
          <div className="text-xl font-bold mb-2">Keskin Zeka!</div>
          <div className="text-gray-400 text-sm">50 yıllık deneyim + bu ekip = kusursuz kod! 💪</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        
        {/* İstatistik Bandı (Hero'dan taşındı) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-white/5">
          {[
            { val: "20+", label: "Yıl Deneyim", icon: "🏆" },
            { val: "50K+", label: "Mutlu Müşteri", icon: "⭐" },
            { val: "500+", label: "Ürün Çeşidi", icon: "🔪" },
            { val: "%100", label: "Güvenli Ödeme", icon: "🔒" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:bg-white/10 transition-colors border border-white/5">
                {s.icon}
              </div>
              <div>
                <div className="font-black text-xl leading-none text-white">{s.val}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-10">
          {/* Logo & Hakkında */}
          <div className="lg:col-span-4 space-y-5">
            <button
              onClick={handleLogoClick}
              className="group relative inline-block transition-transform active:scale-95"
            >
              <Image
                src="/LOGO.png"
                alt="ÜLGEN Paslanmaz"
                width={120}
                height={60}
                className={`object-contain transition-all duration-700 ${showEgg ? 'rotate-[360deg]' : ''}`}
              />
            </button>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Ustalıkla dövülen, hassasiyetle bilenmiş bıçaklar. 
              Ülgen Paslanmaz olarak 20 yılı aşkın süredir en kaliteli çeliği, 
              modern tasarımla buluşturuyoruz.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div className="lg:col-span-2 space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Kurumsal</h4>
             <ul className="space-y-2">
               {footerLinks.kurumsal.map(link => (
                 <li key={link.name}>
                   <Link href={link.href} className="text-xs sm:text-sm text-gray-500 hover:text-white transition-colors">{link.name}</Link>
                 </li>
               ))}
             </ul>
          </div>

          <div className="lg:col-span-2 space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Kategoriler</h4>
             <ul className="space-y-2">
               {footerLinks.kategoriler.map(link => (
                 <li key={link.name}>
                   <Link href={link.href} className="text-xs sm:text-sm text-gray-500 hover:text-white transition-colors">{link.name}</Link>
                 </li>
               ))}
             </ul>
          </div>

          {/* İletişim Bilgileri */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Müşteri Destek</h4>
            <div className="space-y-3">
              <a href="tel:05555555555" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
                  <Phone size={16} />
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase">Bizi Arayın</div>
                  <div className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">0 555 555 55 55</div>
                </div>
              </a>
              <a href="mailto:destek@ulgenpaslanmaz.com" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors border border-white/5">
                  <Mail size={16} />
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase">E-Posta Gönderin</div>
                  <div className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">destek@ulgenpaslanmaz.com</div>
                </div>
              </a>
              <div className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-bold uppercase">Atölye</div>
                  <div className="text-xs font-medium text-gray-300">Sürmene, Trabzon / Türkiye</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="pt-6 mt-2 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-500 text-[9px] uppercase tracking-widest font-bold">
            © {new Date().getFullYear()} ÜLGEN PASLANMAZ. TÜM HAKLARI SAKLIDIR.
          </div>
          <div className="flex items-center gap-4">
            {footerLinks.sozlesmeler.map(link => (
              <Link key={link.name} href={link.href} className="text-[9px] text-gray-500 hover:text-gray-300 transition-colors uppercase font-bold tracking-tighter">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
