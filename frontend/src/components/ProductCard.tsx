type Props = {
  title: string;
  price: number;
  oldPrice?: number;
  image: string;
};

export default function ProductCard({ title, price, oldPrice, image }: Props) {
  return (
    <div className="card overflow-hidden hover:shadow-md transition">
      <img src={image} alt={title} className="w-full aspect-[4/3] object-cover" />
      <div className="p-4">
        <div className="font-medium line-clamp-1">{title}</div>
        <div className="mt-2 flex items-baseline gap-2">
          {oldPrice ? <span className="text-stone-400 line-through">{oldPrice.toFixed(2)} TL</span> : null}
          <span className="text-lg font-semibold">{price.toFixed(2)} TL</span>
        </div>
        <button className="btn btn-primary mt-3 w-full">Sepete Ekle</button>
      </div>
    </div>
  );
}
