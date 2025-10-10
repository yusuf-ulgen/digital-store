type Item = {
  title: string;
  price: number;
  old?: number;
  image: string;
};

export default function HomePage() {
  const items: Item[] = [
    {
      title: "Şef Bıçağı Santoku Paslanmaz Çelik",
      price: 599.0,
      image: "https://picsum.photos/seed/knife1/800/600",
    },
    {
      title: "100. YILA ÖZEL ŞEF BIÇAĞI",
      price: 449.9,
      old: 499.9,
      image: "https://picsum.photos/seed/knife2/800/600",
    },
    {
      title: "Şef Bıçağı Santoku Paslanmaz Çelik",
      price: 599.0,
      image: "https://picsum.photos/seed/knife3/800/600",
    },
    {
      title: "Kırmızı Şef Bıçağı 3 Numara",
      price: 499.9,
      image: "https://picsum.photos/seed/knife4/800/600",
    },
    {
      title: "Şef Bıçağı Fileto Paslanmaz Çelik",
      price: 589.9,
      old: 629.9,
      image: "https://picsum.photos/seed/knife5/800/600",
    },
    {
      title: "Şef Bıçağı 20 Cm No:2 Mutfagınızın İncisi",
      price: 549.9,
      image: "https://picsum.photos/seed/knife6/800/600",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 3'lü grid: görseller küçültülmüş + aralarda boşluklar */}
      <section>
        <div className="section-head">
          <h2 className="text-xl font-semibold">Şef Bıçakları</h2>
          <a className="link-muted text-sm" href="/products">Tümünü Gör</a>
        </div>

        <div className="home-grid">
          {items.map((it, i) => (
            <div key={i} className="home-card">
              <img src={it.image} alt={it.title} />
              <div className="text-sm opacity-80">{it.title}</div>
              <div className="price-line">
                {typeof it.old === "number" && (
                  <span className="price-old">{it.old.toFixed(2)} TL</span>
                )}
                <span className="price-now">{it.price.toFixed(2)} TL</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
