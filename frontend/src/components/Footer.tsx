"use client";

import Image from "next/image";
import { useState } from "react";

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

  return (
    <footer
      style={{
        background: "#232323",
        color: "#ffffff",
        marginTop: "4rem",
      }}
    >
      {/* Easter Egg Popup */}
      {showEgg && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#1a1a1a",
            border: "3px solid #3B82F6",
            borderRadius: "1rem",
            padding: "1.5rem",
            zIndex: 9999,
            textAlign: "center",
            maxWidth: "90%",
            boxShadow: "0 0 40px rgba(59, 130, 246, 0.5)",
            animation: "slideIn 0.25s ease-out",
          }}
        >
          <div style={{ fontSize: "2.25rem", marginBottom: "0.5rem" }}>🔪✨</div>
          <div style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.25rem" }}>
            Keskin Zeka!
          </div>
          <div style={{ fontSize: "0.95rem", opacity: 0.9 }}>
            50 yıllık deneyim + bu ekip = kusursuz kod! 💪
          </div>
        </div>
      )}

      {/* Üst Bölüm — 3 sütun */}
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "1rem 1rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        {/* SOL SÜTUN */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              letterSpacing: "0.05em",
            }}
          >
            ÜLGEN Paslanmaz
          </div>

          {/* LOGO — public/LOGO.png */}
          <button
            onClick={handleLogoClick}
            title="Logoya 5 kez tıkla ;)"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.4s",
              transform: showEgg ? "rotate(360deg)" : "none",
              padding: 0,
              border: "none",
              background: "transparent",
            }}
          >
            <Image
              src="/LOGO.png"
              alt="ÜLGEN Paslanmaz Logosu"
              width={100}
              height={100}
              style={{
                objectFit: "contain",
              }}
            />
          </button>

          <p style={{ fontSize: "0.9rem", lineHeight: 1.6, opacity: 0.9, maxWidth: "34rem" }}>
            Sizlerin ihtiyacını çok iyi biliyoruz. Usta ellerin hazırladığı kaliteli ve
            keskin bıçakları sizler için yapıyoruz. 50 yıldan fazladır ürettiğimiz
            bıçaklar dünyanın dört bir yanına gönderilmektedir.
          </p>
        </div>

        {/* ORTA SÜTUN — KURUMSAL */}
        <div>
          <div
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              opacity: 0.9,
              marginBottom: "0.75rem",
            }}
          >
            KURUMSAL
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
            }}
          >
            {[
              "İletişim",
              "İade / Değişim",
              "Kargo Süreci",
              "Mesafeli Satış Sözleşmesi",
              "Gizlilik Politikası",
              "Hakkımızda",
            ].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  style={{ color: "#ffffff", textDecoration: "none", fontSize: "0.9rem", opacity: 0.9 }}
                  onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* SAĞ SÜTUN — KATEGORİLER + SOSYAL */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                opacity: 0.9,
                marginBottom: "0.75rem",
              }}
            >
              KATEGORİLER
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
                marginBottom: "1rem",
              }}
            >
              {[
                "Bıçak Çeşitleri",
                "Meyve Bıçakları",
                "Sebze Bıçakları",
                "Ekmek Bıçakları",
                "Kasap Bıçakları",
                "Bıçak Setleri",
                "Bileyici & Masatlar",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{ color: "#ffffff", textDecoration: "none", fontSize: "0.9rem", opacity: 0.9 }}
                    onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sosyal */}
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "auto" }}>
            <a
              href="#"
              aria-label="Facebook"
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#ffffff",
                textDecoration: "none",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              f
            </a>
            <a
              href="#"
              aria-label="Instagram"
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#ffffff",
                textDecoration: "none",
                fontSize: "1.1rem",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >
              ●
            </a>
          </div>
        </div>
      </div>

      {/* AYRAÇ */}
      <div style={{ height: "1px", background: "#282828" }}></div>

      {/* TELİF */}
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "0.9rem 1rem",
          textAlign: "center",
          fontSize: "0.75rem",
          opacity: 0.7,
        }}
      >
        © {new Date().getFullYear()}, ÜLGEN Paslanmaz. Tüm Hakları Saklıdır.
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translate(-50%, -60%); opacity: 0; }
          to   { transform: translate(-50%, -50%); opacity: 1; }
        }
      `}</style>
    </footer>
  );
}
