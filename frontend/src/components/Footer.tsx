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
            padding: "2rem",
            zIndex: 9999,
            textAlign: "center",
            maxWidth: "90%",
            boxShadow: "0 0 40px rgba(59, 130, 246, 0.5)",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔪✨</div>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            Keskin Zeka!
          </div>
          <div style={{ fontSize: "1rem", opacity: 0.9 }}>
            50 yıllık deneyim + bu ekip = kusursuz kod! 💪
          </div>
        </div>
      )}

      {/* Üst Bölüm — 3 sütun */}
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "3rem 1rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "3rem",
        }}
      >
        {/* SOL SÜTUN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              letterSpacing: "0.05em",
            }}
          >
            ÜLGEN Paslanmaz
          </div>

          {/* LOGO — public/Y.svg */}
          <div
            onClick={handleLogoClick}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.2s",
              transform: showEgg ? "rotate(360deg)" : "none",
            }}
            title="Logoya 5 kez tıkla ;)"
          >
            <Image
              src="/Y.svg"      // <- senin logon (public/Y.svg)
              alt="ÜLGEN Paslanmaz Logosu"
              width={80}
              height={80}
              style={{ filter: "invert(1)", opacity: 0.95 }}
            />
          </div>

          <p style={{ fontSize: "0.875rem", lineHeight: "1.5", opacity: 0.9 }}>
            Sizlerin ihtiyacını çok iyi biliyoruz. Usta ellerin hazırladığı kaliteli ve
            keskin bıçakları sizler için yapıyoruz. 50 yıldan fazladır ürettiğimiz
            bıçaklar dünyanın dört bir yanına gönderilmektedir.
          </p>
        </div>

        {/* ORTA SÜTUN - KURUMSAL */}
        <div>
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: "600",
              letterSpacing: "0.1em",
              opacity: 0.9,
              marginBottom: "1rem",
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
              gap: "0.5rem",
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
                  style={{
                    color: "#ffffff",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    opacity: 0.9,
                    transition: "opacity 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "0.9")}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* SAĞ SÜTUN - KATEGORİLER + SOSYAL */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                letterSpacing: "0.1em",
                opacity: 0.9,
                marginBottom: "1rem",
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
                gap: "0.5rem",
                marginBottom: "1.5rem",
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
                    style={{
                      color: "#ffffff",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      opacity: 0.9,
                      transition: "opacity 0.2s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseOut={(e) => (e.currentTarget.style.opacity = "0.9")}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sosyal */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "auto" }}>
            <a
              href="#"
              aria-label="Facebook"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#ffffff",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              f
            </a>
            <a
              href="#"
              aria-label="Instagram"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#ffffff",
                textDecoration: "none",
                fontSize: "1.2rem",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
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
          padding: "1.25rem 1rem",
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
